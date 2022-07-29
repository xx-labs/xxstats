//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/getValidatorPayouts.js
//

// Required imports
import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {

  const wsProvider = 'ws://dev.xx-network.polkastats.io:9944';
  const authorityId = '6YJNRiCq8za9aYDFL3nzDZxsE72CqciVDptvirLesDBk4Fks';
  const stakingQueryFlags = {
    withController: true,
    withDestination: false,
    withExposure: true,
    withLedger: true,
    withNominations: false,
    withPrefs: true,
  };
  const historySize = 28;
  let payoutHistory: { era: number; status: string; }[] = [];

  // Initialise the provider to connect to the remote node
  const provider = new WsProvider(wsProvider);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  const withActive = false;

  const erasHistoric = await api.derive.staking.erasHistoric(withActive);

  const eraIndexes = erasHistoric.slice(
    Math.max(erasHistoric.length - historySize, 0),
  );

  const erasPoints = await api.derive.staking._erasPoints(
    eraIndexes,
    withActive,
  );

  // Retrieve validator staking information via rpc call
  const validatorStakingInfo = await api.derive.staking.query(authorityId, stakingQueryFlags);

  erasPoints.forEach((eraPoints) => {
    const { era } = eraPoints;
    const claimedRewards: number[] = JSON.parse(validatorStakingInfo.stakingLedger.claimedRewards.toString());
    let eraPayoutState = 'inactive';
    if (eraPoints.validators[authorityId]) {
      if (claimedRewards.includes(era.toNumber())) {
        eraPayoutState = 'paid';
      } else {
        eraPayoutState = 'pending';
      }

    }
    payoutHistory.push({
      era: era.toNumber(),
      status: eraPayoutState,
    });
  });

  console.log(JSON.stringify(payoutHistory, null, 2));
}

main().catch(console.error).finally(() => process.exit());
