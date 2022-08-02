// @ts-check
import * as Sentry from '@sentry/node';
import { BigNumber } from 'bignumber.js';
import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import { getClient, dbQuery } from '../lib/db';
import { getPolkadotAPI, isNodeSynced } from '../lib/chain';
import {
  getDashboardApiInfo,
  getLastEraInDb,
  getAddressCreation,
  parseIdentity,
  getClusterInfo,
  getCommissionHistory,
  getCommissionRating,
  getPayoutRating,
  insertEraValidatorStats,
  insertEraValidatorStatsAvg,
  insertRankingValidator,
  transformCmixId,
} from '../lib/staking';
import { wait, getRandom } from '../lib/utils';
import { backendConfig } from '../backend.config';
import {
  CrawlerConfig,
  EraPointsHistoryItem,
  PayoutHistoryItem,
  PerformanceHistoryItem,
  RelativePerformanceHistoryItem,
  StakeHistoryItem,
  StakingQueries,
  ValidatorOrIntention,
} from '../lib/types';
import { logger } from '../lib/logger';

const crawlerName = 'ranking';

Sentry.init({
  dsn: backendConfig.sentryDSN,
  tracesSampleRate: 1.0,
});

const loggerOptions = {
  crawler: crawlerName,
};

const config: CrawlerConfig = backendConfig.crawlers.find(
  ({ name }) => name === crawlerName,
);

const crawler = async (delayedStart: boolean) => {
  if (delayedStart) {
    logger.info(
      loggerOptions,
      `Delaying ranking crawler start for ${config.startDelay / 1000}s`,
    );
    await wait(config.startDelay);
  }

  logger.info(loggerOptions, 'Starting ranking crawler');
  const startTime = new Date().getTime();

  const client = await getClient(loggerOptions);
  const api = await getPolkadotAPI(loggerOptions, config.apiCustomTypes);

  let synced = await isNodeSynced(api, loggerOptions);
  while (!synced) {
    await wait(10000);
    synced = await isNodeSynced(api, loggerOptions);
  }

  const clusters: any = [];
  const stakingQueryFlags = {
    withDestination: false,
    withExposure: true,
    withLedger: true,
    withNominations: false,
    withPrefs: true,
  };
  const minMaxEraPerformance: any = [];
  const participateInGovernance: any = [];
  let validators: ValidatorOrIntention[] = [];
  let intentions: ValidatorOrIntention[] = [];
  let maxPerformance = 0;
  let minPerformance = 0;

  //
  // data collection
  //

  try {
    const lastEraInDb = await getLastEraInDb(client, loggerOptions);
    logger.debug(loggerOptions, `Last era in DB is ${lastEraInDb}`);

    // dashboard API data
    logger.debug(
      loggerOptions,
      'Fetching dashboard API data ...',
    );
    const dashboardApiInfo = await getDashboardApiInfo(loggerOptions);
    logger.debug(
      loggerOptions,
      `Got info of ${dashboardApiInfo.length} validators from dashboard API`,
    );

    // chain data
    logger.debug(loggerOptions, 'Fetching chain data ...');
    const withActive = false;

    logger.debug(loggerOptions, 'Step #1');
    const [erasHistoric, chainCurrentEra, chainActiveEra] = await Promise.all([
      api.derive.staking.erasHistoric(withActive),
      api.query.staking.currentEra(),
      api.query.staking.activeEra(),
    ]);
    const eraIndexes = erasHistoric.slice(
      Math.max(erasHistoric.length - config.historySize, 0),
    );
    const { maxNominatorRewardedPerValidator } = api.consts.staking;

    logger.debug(loggerOptions, 'Step #2');
    const [
      { block },
      validatorAddresses,
      waitingInfo,
      nominators,
      councilVotes,
      proposals,
      referendums,
    ]: StakingQueries = await Promise.all([
      api.rpc.chain.getBlock(),
      api.query.session.validators(),
      api.derive.staking.waitingInfo(stakingQueryFlags),
      api.query.staking.nominators.entries(),
      api.derive.council.votes(),
      api.derive.democracy.proposals(),
      api.derive.democracy.referendums(),
    ]);

    logger.debug(loggerOptions, 'Step #3');
    // eslint-disable-next-line no-underscore-dangle
    const erasPoints = await api.derive.staking._erasPoints(
      eraIndexes,
      withActive,
    );

    logger.debug(loggerOptions, 'Step #4');
    let erasPreferences: any[] = [];
    for (const eraIndex of eraIndexes) {
      const eraPrefs = await api.derive.staking.eraPrefs(eraIndex);
      erasPreferences = erasPreferences.concat(eraPrefs);
    }

    logger.debug(loggerOptions, 'Step #5');
    let erasSlashes: any[] = [];
    for (const eraIndex of eraIndexes) {
      const eraSlashes = await api.derive.staking.eraSlashes(eraIndex);
      erasSlashes = erasSlashes.concat(eraSlashes);
    }

    logger.debug(loggerOptions, 'Step #6');
    let erasExposure: any[] = [];
    for (const eraIndex of eraIndexes) {
      const eraExposure = await api.derive.staking.eraExposure(eraIndex);
      erasExposure = erasExposure.concat(eraExposure);
    }

    logger.debug(loggerOptions, 'Step #7');
    validators = await Promise.all(
      validatorAddresses.map((authorityId: AccountId32) =>
        api.derive.staking.query(authorityId, stakingQueryFlags).then((validator) => ({ info: validator })),
      ),
    );

    logger.debug(loggerOptions, 'Step #8');
    validators = await Promise.all(
      validators.map((validator: ValidatorOrIntention) =>
        api.derive.accounts.info(validator.info.accountId).then(({ identity }) => ({
          info: validator.info,
          identity,
          active: true,
        })),
      ),
    );

    // get validator session ids and next session ids
    logger.debug(loggerOptions, 'Step #9');
    validators = await Promise.all(
      validators.map((validator: ValidatorOrIntention) =>
        api.derive.staking.keys(validator.info.accountId).then(({ sessionIds, nextSessionIds }) => ({
          ...validator,
          sessionIds: sessionIds.map((sessionId) => sessionId.toString()),
          nextSessionIds: nextSessionIds.map((nextSessionId) => nextSessionId.toString()),
        })),
      ),
    );

    logger.debug(loggerOptions, 'Step #10');
    intentions = await Promise.all(
      waitingInfo.info.map((intention) =>
        api.derive.accounts.info(intention.accountId).then(({ identity }) => ({
          info: intention,
          identity,
          active: false,
        })),
      ),
    );

    // get intention session ids and next session ids
    logger.debug(loggerOptions, 'Step #11');
    intentions = await Promise.all(
      intentions.map((intention: ValidatorOrIntention) =>
        api.derive.staking.keys(intention.info.accountId).then(({ sessionIds, nextSessionIds }) => ({
          ...intention,
          sessionIds: sessionIds.map((sessionId) => sessionId.toString()),
          nextSessionIds: nextSessionIds.map((nextSessionId) => nextSessionId.toString()),
        })),
      ),
    );

    const dataCollectionEndTime = new Date().getTime();
    const dataCollectionTime = dataCollectionEndTime - startTime;
    logger.debug(loggerOptions, 'Done!');

    //
    // data processing
    //
    logger.debug(loggerOptions, 'Processing data ...');
    const blockHeight = parseInt(block.header.number.toString(), 10);
    const numActiveValidators = validatorAddresses.length;
    const eraPointsHistoryTotals: any = [];
    erasPoints.forEach(({ eraPoints }) => {
      eraPointsHistoryTotals.push(parseInt(eraPoints.toString(), 10));
    });
    const eraPointsHistoryTotalsSum = eraPointsHistoryTotals.reduce(
      (total: any, num: any) => total + num,
      0,
    );
    const eraPointsAverage = eraPointsHistoryTotalsSum / numActiveValidators;

    // dashboard metrics
    const activeValidatorCount = validatorAddresses.length;
    const waitingValidatorCount = waitingInfo.info.length;
    const nominatorCount = nominators.length;
    const currentEra = chainCurrentEra.toString();
    const activeEra = JSON.parse(JSON.stringify(chainActiveEra)).index;

    // minimun stake
    logger.debug(loggerOptions, 'Finding minimum stake');
    const nominatorStakes = [];
    // eslint-disable-next-line
    for (const validator of validators) {
      // eslint-disable-next-line
      for (const nominatorStake of validator.info.exposure.others) {
        nominatorStakes.push(nominatorStake.value);
      }
    }
    nominatorStakes.sort((a, b) => (a.unwrap().lt(b.unwrap()) ? -1 : 1));
    const minimumStake = nominatorStakes[0];

    logger.debug(loggerOptions, `${activeValidatorCount} active validators`);
    logger.debug(loggerOptions, `${waitingValidatorCount} waiting validators`);
    logger.debug(loggerOptions, `${nominatorCount} nominators`);
    logger.debug(loggerOptions, `Current era is ${currentEra}`);
    logger.debug(loggerOptions, `Active era is ${activeEra}`);
    logger.debug(loggerOptions, `Minimum amount to stake is ${minimumStake}`);

    await Promise.all([
      dbQuery(
        client,
        `UPDATE total SET count = '${activeValidatorCount}' WHERE name = 'active_validator_count'`,
        loggerOptions,
      ),
      dbQuery(
        client,
        `UPDATE total SET count = '${waitingValidatorCount}' WHERE name = 'waiting_validator_count'`,
        loggerOptions,
      ),
      dbQuery(
        client,
        `UPDATE total SET count = '${nominatorCount}' WHERE name = 'nominator_count'`,
        loggerOptions,
      ),
      dbQuery(
        client,
        `UPDATE total SET count = '${currentEra}' WHERE name = 'current_era'`,
        loggerOptions,
      ),
      dbQuery(
        client,
        `UPDATE total SET count = '${activeEra}' WHERE name = 'active_era'`,
        loggerOptions,
      ),
      dbQuery(
        client,
        `UPDATE total SET count = '${minimumStake}' WHERE name = 'minimum_stake'`,
        loggerOptions,
      ),
    ]);

    // eslint-disable-next-line
    const allNominations = nominators.map(([key, nominations]: [any, any]) => {
      const nominator = key.toHuman()[0];
      // eslint-disable-next-line
      const targets = nominations.toJSON()['targets'];
      return {
        nominator,
        targets,
      };
    });
    proposals.forEach(({ seconds, proposer }) => {
      participateInGovernance.push(proposer.toString());
      seconds.forEach((accountId) =>
        participateInGovernance.push(accountId.toString()),
      );
    });
    referendums.forEach(({ votes }) => {
      votes.forEach(({ accountId }) =>
        participateInGovernance.push(accountId.toString()),
      );
    });

    // merge validators and intentions
    const validatorsAndIntentions: ValidatorOrIntention[]  = validators.concat(intentions);

    // stash & identity parent address creation block
    const stashAddressesCreation: any[string] = [];
    for (const validator of validatorsAndIntentions) {
      const stashAddress: string = validator.info.stashId.toString();
      stashAddressesCreation[stashAddress] = await getAddressCreation(
        client,
        stashAddress,
        loggerOptions,
      );
      if (validator.identity.parent) {
        const stashParentAddress: string = validator.identity.parent.toString();
        stashAddressesCreation[stashParentAddress] = await getAddressCreation(
          client,
          stashParentAddress,
          loggerOptions,
        );
      }
    }

    logger.debug(loggerOptions, 'Starting validator loop...');

    let ranking: ValidatorOrIntention[] = validatorsAndIntentions
      .map((validator) => {

        // stash address
        const stashAddress = validator.info.stashId.toString();

        // active
        const { active } = validator;
        const activeRating = active ? 2 : 0;

        // stash address creation
        let addressCreationRating = 0;
        const stashCreatedAtBlock = parseInt(
          stashAddressesCreation[stashAddress],
          10,
        );
        let stashParentCreatedAtBlock = 0;
        if (validator.identity.parent) {
          stashParentCreatedAtBlock = parseInt(
            stashAddressesCreation[validator.identity.parent.toString()],
            10,
          );
          const best =
            stashParentCreatedAtBlock > stashCreatedAtBlock
              ? stashCreatedAtBlock
              : stashParentCreatedAtBlock;
          if (best <= blockHeight / 4) {
            addressCreationRating = 3;
          } else if (best <= (blockHeight / 4) * 2) {
            addressCreationRating = 2;
          } else if (best <= (blockHeight / 4) * 3) {
            addressCreationRating = 1;
          }
        } else if (stashCreatedAtBlock <= blockHeight / 4) {
          addressCreationRating = 3;
        } else if (stashCreatedAtBlock <= (blockHeight / 4) * 2) {
          addressCreationRating = 2;
        } else if (stashCreatedAtBlock <= (blockHeight / 4) * 3) {
          addressCreationRating = 1;
        }

        // dashboard info
        const dashboardInfo = dashboardApiInfo.find(
          ({ walletAddress }: { walletAddress: any }) => walletAddress === stashAddress,
        ) || {};

        // thousand validator
        const thousandValidator = '';
        const includedThousandValidators = false;

        // controller
        const controllerAddress = validator.info.controllerId.toString();

        // cmix id in H256 format
        const cmixIdHex = validator.info.stakingLedger.cmixId.toString();

        // cmix id
        const cmixId = validator.info.stakingLedger.cmixId.isSome ? transformCmixId(validator.info.stakingLedger.cmixId) : '';

        // session ids
        const sessionIds = validator.sessionIds;
        
        // next session ids
        const nextsessionIds = validator.nextSessionIds;

        // location
        const location = dashboardInfo?.location ? dashboardInfo.location : '';

        // identity
        const { verifiedIdentity, hasSubIdentity, name, identityRating } =
          parseIdentity(validator.identity);
        const identity = JSON.parse(JSON.stringify(validator.identity));

        // sub-accounts
        const { clusterMembers, clusterName } = getClusterInfo(
          hasSubIdentity,
          validators,
          validator.identity,
        );
        if (clusterName && !clusters.includes(clusterName)) {
          clusters.push(clusterName);
        }
        const partOfCluster = clusterMembers > 1;
        const subAccountsRating = hasSubIdentity ? 2 : 0;

        // nominators
        
        //
        // TODO: refactor this!
        // use a type for nominations and use it for active/inactive validators
        //

        // # of nominators the validator has
        const validatorNominators = active
          ? validator.info.exposure.others.length
          : allNominations.filter((nomination) =>
            nomination.targets.some(
              (target: any) => target === stashAddress,
            ),
          ).length;
        const nominatorsRating =
        validatorNominators > 0 &&
        validatorNominators <= maxNominatorRewardedPerValidator.toNumber()
          ? 2
          : 0;
        const nominations = active
          ? validator.info.exposure.others
          : allNominations.filter((nomination) =>
            nomination.targets.some(
              (target: any) => target === stashAddress,
            ),
          );

        // slashes
        const slashes =
          erasSlashes.filter(
            // eslint-disable-next-line
            ({ validators }: { validators: any }) =>
              validators[stashAddress],
          ) || [];
        const slashed = slashes.length > 0;
        const slashRating = slashed ? 0 : 2;

        // commission
        const commission =
          parseInt(validator.info.validatorPrefs.commission.toString(), 10) /
          10000000;
        const commissionHistory = getCommissionHistory(
          stashAddress,
          erasPreferences,
        );
        const commissionRating = getCommissionRating(
          commission,
          commissionHistory,
        );

        // governance
        const councilBacking = validator.identity?.parent
          ? councilVotes.some(
            (vote) => vote[0].toString() === stashAddress,
          ) ||
            councilVotes.some(
              (vote) =>
                vote[0].toString() === validator.identity.parent.toString(),
            )
          : councilVotes.some(
            (vote) => vote[0].toString() === stashAddress,
          );
        const activeInGovernance = validator.identity?.parent
          ? participateInGovernance.includes(stashAddress) ||
            participateInGovernance.includes(
              validator.identity.parent.toString(),
            )
          : participateInGovernance.includes(stashAddress);
        let governanceRating = 0;
        if (councilBacking && activeInGovernance) {
          governanceRating = 3;
        } else if (councilBacking || activeInGovernance) {
          governanceRating = 2;
        }

        // era points and frecuency of payouts
        const eraPointsHistory: EraPointsHistoryItem[] = [];
        const payoutHistory: PayoutHistoryItem[] = [];
        const performanceHistory: PerformanceHistoryItem[] = [];
        const stakeHistory: StakeHistoryItem[] = [];

        let activeEras = 0;
        let performance = 0;

        erasPoints.forEach((eraPoints) => {
          const { era } = eraPoints;
          let eraPayoutState = 'inactive';
          let eraPerformance = 0;
          if (eraPoints.validators[stashAddress]) {
            activeEras += 1;
            const points = parseInt(
              eraPoints.validators[stashAddress].toString(),
              10,
            );
            eraPointsHistory.push({
              era: new BigNumber(era.toString()).toString(10),
              points,
            });
            const claimedRewards: number[] = JSON.parse(validator.info.stakingLedger.claimedRewards.toString());
            if (claimedRewards.includes(era.toNumber())) {
              eraPayoutState = 'paid';
            } else {
              eraPayoutState = 'pending';
            }
            // era performance

            // TODO: check undefined
            const eraTotalStake = new BigNumber(
              erasExposure.find(
                (eraExposure: any) => eraExposure.era === era,
              ).validators[stashAddress]?.total || 0,
            );

            // TODO: check undefined
            const eraSelfStake = new BigNumber(
              erasExposure.find(
                (eraExposure: any) => eraExposure.era === era,
              ).validators[stashAddress]?.own || 0,
            );

            const eraOthersStake = eraTotalStake.minus(eraSelfStake);
            stakeHistory.push({
              era: new BigNumber(era.toString()).toString(10),
              self: eraSelfStake.toString(10),
              others: eraOthersStake.toString(10),
              total: eraTotalStake.toString(10),
            });

            // edge case when validator has era points but no stake at the era
            if (eraTotalStake.toNumber() !== 0 && commission !== 0) {
              eraPerformance =
                (points * (1 - (commission / 100) )) /
                eraTotalStake
                  .div(new BigNumber(10).pow(config.tokenDecimals))
                  .toNumber();
            } else {
              eraPerformance = 0;
            }
            performanceHistory.push({
              era: new BigNumber(era.toString()).toString(10),
              performance: eraPerformance,
            });
          } else {
            // validator was not active in that era
            eraPointsHistory.push({
              era: new BigNumber(era.toString()).toString(10),
              points: 0,
            });
            stakeHistory.push({
              era: new BigNumber(era.toString()).toString(10),
              self: '0',
              others: '0',
              total: '0',
            });
            performanceHistory.push({
              era: new BigNumber(era.toString()).toString(10),
              performance: 0,
            });
          }
          payoutHistory.push({
            era: new BigNumber(era.toString()).toString(10),
            status: eraPayoutState,
          });
          // total performance
          performance += eraPerformance;
        });

        const eraPointsHistoryValidator = eraPointsHistory.reduce(
          (total: any, era: any) => total + era.points,
          0,
        );
        const eraPointsPercent =
          (eraPointsHistoryValidator * 100) / eraPointsHistoryTotalsSum;
        const eraPointsRating =
          eraPointsHistoryValidator > eraPointsAverage ? 2 : 0;
        const payoutRating = getPayoutRating(config, payoutHistory);

        // stake
        const selfStake = active
          ? new BigNumber(validator.info.exposure.own.toString())
          : new BigNumber(validator.info.stakingLedger.total.toString());
        const totalStake = active
          ? new BigNumber(validator.info.exposure.total.toString())
          : selfStake;
        const otherStake = active
          ? totalStake.minus(selfStake)
          : new BigNumber(0);

        // performance
        if (performance > maxPerformance) {
          maxPerformance = performance;
        }
        if (performance < minPerformance) {
          minPerformance = performance;
        }

        const showClusterMember = true;

        // VRC score
        const totalRating =
          activeRating +
          addressCreationRating +
          identityRating +
          subAccountsRating +
          nominatorsRating +
          commissionRating +
          eraPointsRating +
          slashRating +
          governanceRating +
          payoutRating;

        return {
          active,
          activeRating,
          name,
          identity,
          hasSubIdentity,
          subAccountsRating,
          verifiedIdentity,
          identityRating,
          stashAddress,
          stashCreatedAtBlock,
          stashParentCreatedAtBlock,
          addressCreationRating,
          controllerAddress,
          cmixId,
          cmixIdHex,
          sessionIds,
          nextsessionIds,
          dashboardInfo,
          location,
          includedThousandValidators,
          thousandValidator,
          partOfCluster,
          clusterName,
          clusterMembers,
          showClusterMember,
          nominators: validatorNominators,
          nominatorsRating,
          nominations,
          commission,
          commissionHistory,
          commissionRating,
          activeEras,
          eraPointsHistory,
          eraPointsPercent,
          eraPointsRating,
          performance,
          performanceHistory,
          slashed,
          slashRating,
          slashes,
          councilBacking,
          activeInGovernance,
          governanceRating,
          payoutHistory,
          payoutRating,
          selfStake,
          otherStake,
          totalStake,
          stakeHistory,
          totalRating,
        };
      })
      .sort((a: ValidatorOrIntention, b: ValidatorOrIntention) => (a.totalRating < b.totalRating ? 1 : -1))
      .map((validator: ValidatorOrIntention, rank: number) => {
        const relativePerformance = parseFloat((
          (validator.performance - minPerformance) /
          (maxPerformance - minPerformance)
        ).toFixed(6));
        // debug
        // logger.debug(loggerOptions, `${validator.stashAddress}, performance: ${validator.performance}, maxPerformance: ${maxPerformance}, minPerformance: ${minPerformance}, rel. performance: ${relativePerformance}`);
        const dominated = false;
        const relativePerformanceHistory: any = [];
        return {
          rank: rank + 1,
          relativePerformance,
          relativePerformanceHistory,
          ...validator,
          dominated,
        };
      });

    // populate minMaxEraPerformance
    eraIndexes.forEach((eraIndex) => {
      const era = new BigNumber(eraIndex.toString()).toString(10);
      const eraPerformances = ranking
        .map(
          ({ performanceHistory }) =>
            performanceHistory.find((performance) => performance.era === era)
              .performance,
        );
      minMaxEraPerformance.push({
        era,
        min: Math.min(...eraPerformances),
        max: Math.max(...eraPerformances),
      });
    });

    // find largest cluster size
    const largestCluster = Math.max(
      ...Array.from(ranking, (o: any) => o.clusterMembers),
    );
    logger.debug(loggerOptions, `LARGEST cluster size is ${largestCluster}`);
    logger.debug(
      loggerOptions,
      `SMALL cluster size is between 2 and ${Math.round(largestCluster / 3)}`,
    );
    logger.debug(
      loggerOptions,
      `MEDIUM cluster size is between ${Math.round(largestCluster / 3)} and ${
        Math.round(largestCluster / 3) * 2
      }`,
    );
    logger.debug(
      loggerOptions,
      `LARGE cluster size is between ${Math.round(
        (largestCluster / 3) * 2,
      )} and ${largestCluster}`,
    );
    // find Pareto-dominated validators
    logger.debug(loggerOptions, 'Finding dominated validators');
    const dominatedStart = new Date().getTime();
    ranking = ranking.map((validator: ValidatorOrIntention) => {
      // populate relativePerformanceHistory
      const relativePerformanceHistory: RelativePerformanceHistoryItem[] = [];
      validator.performanceHistory.forEach((performance: PerformanceHistoryItem) => {
        const eraMinPerformance = minMaxEraPerformance.find(
          ({ era }: { era: any }) => era === performance.era,
        ).min;
        const eraMaxPerformance = minMaxEraPerformance.find(
          ({ era }: { era: any }) => era === performance.era,
        ).max;
        const relativePerformance = (
          (performance.performance - eraMinPerformance) /
          (eraMaxPerformance - eraMinPerformance)
        ).toFixed(6);
        relativePerformanceHistory.push({
          era: performance.era,
          relativePerformance: parseFloat(relativePerformance),
        });
      });
      // dominated validator logic
      let dominated = false;
      for (const opponent of ranking) {
        if (
          opponent !== validator &&
          opponent.relativePerformance >= validator.relativePerformance &&
          opponent.selfStake.gte(validator.selfStake) &&
          opponent.activeEras >= validator.activeEras &&
          opponent.totalRating >= validator.totalRating
        ) {
          dominated = true;
          break;
        }
      }
      return {
        ...validator,
        relativePerformanceHistory,
        dominated,
      };
    });
    const dominatedEnd = new Date().getTime();
    logger.debug(
      loggerOptions,
      `Found ${
        ranking.filter(({ dominated }) => dominated).length
      } dominated validators in ${(
        (dominatedEnd - dominatedStart) /
        1000
      ).toFixed(3)}s`,
    );

    // cluster categorization
    logger.debug(
      loggerOptions,
      'Random selection of validators based on cluster size',
    );
    let validatorsToHide: any = [];
    for (const cluster of clusters) {
      const clusterMembers = ranking.filter(
        ({ clusterName }) => clusterName === cluster,
      );
      const clusterSize = clusterMembers[0].clusterMembers;
      // EXTRASMALL: 2 - Show all (2)
      let show = 2;
      if (clusterSize > 50) {
        // EXTRALARGE: 51-150 - Show 20% val. (up to 30)
        show = Math.floor(clusterSize * 0.2);
      } else if (clusterSize > 20) {
        // LARGE: 21-50 - Show 40% val. (up to 20)
        show = Math.floor(clusterSize * 0.4);
      } else if (clusterSize > 10) {
        // MEDIUM: 11-20 - Show 60% val. (up to 12)
        show = Math.floor(clusterSize * 0.6);
      } else if (clusterSize > 2) {
        // SMALL: 3-10 - Show 80% val. (up to 8)
        show = Math.floor(clusterSize * 0.8);
      }
      const hide = clusterSize - show;
      // randomly select 'hide' number of validators
      // from cluster and set 'showClusterMember' prop to false
      const rankingPositions = clusterMembers.map(
        (validator: any) => validator.rank,
      );
      validatorsToHide = validatorsToHide.concat(
        getRandom(rankingPositions, hide),
      );
    }
    ranking = ranking.map((validator: any) => {
      const modValidator = validator;
      if (validatorsToHide.includes(validator.rank)) {
        modValidator.showClusterMember = false;
      }
      return modValidator;
    });
    logger.debug(
      loggerOptions,
      `Finished, ${validatorsToHide.length} validators hided!`,
    );

    // We want to store era stats only when there's a new consolidated era in chain history
    if (parseInt(activeEra, 10) - 1 > parseInt(lastEraInDb, 10)) {
      logger.debug(loggerOptions, 'Storing era stats in db...');
      await Promise.all(
        ranking.map((validator: any) =>
          insertEraValidatorStats(client, validator, activeEra, loggerOptions),
        ),
      );
      logger.debug(loggerOptions, 'Storing era stats averages in db...');
      await Promise.all(
        eraIndexes.map((eraIndex) =>
          insertEraValidatorStatsAvg(client, eraIndex, loggerOptions),
        ),
      );
    } else {
      logger.debug(loggerOptions, 'Updating era averages is not needed!');
    }

    logger.debug(
      loggerOptions,
      `Storing ${ranking.length} validators in db...`,
    );
    await Promise.all(
      ranking.map((validator: any) =>
        insertRankingValidator(
          client,
          validator,
          blockHeight,
          startTime,
          loggerOptions,
        ),
      ),
    );

    logger.debug(loggerOptions, 'Cleaning old data');
    await dbQuery(
      client,
      `DELETE FROM ranking WHERE block_height != '${blockHeight}';`,
      loggerOptions,
    );

    // featured validator
    // const sql =
    //   'SELECT stash_address, timestamp FROM featured ORDER BY timestamp DESC LIMIT 1';
    // const res = await dbQuery(client, sql, loggerOptions);
    // if (res.rows.length === 0) {
    //   await addNewFeaturedValidator(config, client, ranking, loggerOptions);
    // } else {
    //   const currentFeatured = res.rows[0];
    //   const currentTimestamp = new Date().getTime();
    //   if (
    //     currentTimestamp - currentFeatured.timestamp >
    //     config.featuredTimespan
    //   ) {
    //     // timespan passed, let's add a new featured validator
    //     await addNewFeaturedValidator(config, client, ranking, loggerOptions);
    //   }
    // }

    logger.debug(loggerOptions, 'Disconnecting from API');
    await api
      .disconnect()
      .catch((error: any) =>
        logger.error(
          loggerOptions,
          `API disconnect error: ${JSON.stringify(error.message)}`,
        ),
      );

    logger.debug(loggerOptions, 'Disconnecting from DB');
    await client
      .end()
      .catch((error: any) =>
        logger.error(
          loggerOptions,
          `DB disconnect error: ${JSON.stringify(error.message)}`,
        ),
      );

    const endTime = new Date().getTime();
    const dataProcessingTime = endTime - dataCollectionEndTime;
    logger.info(
      loggerOptions,
      `Added ${ranking.length} validators in ${(
        (dataCollectionTime + dataProcessingTime) /
        1000
      ).toFixed(3)}s`,
    );
    logger.info(
      loggerOptions,
      `Next execution in ${(config.pollingTime / 60000).toFixed(0)}m...`,
    );
  } catch (error: any) {
    logger.error(
      loggerOptions,
      `General error in ranking crawler: ${JSON.stringify(error.message)}`,
    );
    logger.error(
      loggerOptions,
      `Error stack: ${JSON.stringify(error.stack)}`,
    );
    Sentry.captureException(error);
  }
  setTimeout(() => crawler(false), config.pollingTime);
};

crawler(true).catch((error) => {
  logger.error(loggerOptions, `Crawler error: ${error}`);
  Sentry.captureException(error);
  process.exit(-1);
});
