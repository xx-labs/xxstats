//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/getXXValidatorsStakingInfo.js
//

// Required imports
import { ApiPromise, WsProvider } from '@polkadot/api';
import { DeriveStakingQueryWithCmixId, DeriveStakingWaitingWithCmixId } from '../lib/types';
import type { Option } from '@polkadot/types-codec';
import type { H256 } from '@polkadot/types/interfaces/runtime';

const stakingQueryFlags = {
  withDestination: false,
  withExposure: true,
  withLedger: true,
  withNominations: false,
  withPrefs: true,
};

const toByteArray = (nodeId: H256) => Buffer.concat([nodeId.toU8a(true), new Uint8Array([2])]);
const toBase64 = (cmixId: Buffer) => cmixId.toString('base64');
const transformCmixAddress = (nodeId?: Option<H256>): string | undefined => (nodeId?.isSome && Number(nodeId) !== 0) ? toBase64(toByteArray(nodeId.unwrap())) : '';

async function main() {

  const wsProvider = 'ws://116.202.87.211:9944';

  // Initialise the provider to connect to the remote node
  const provider = new WsProvider(wsProvider);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  /// Get waiting nodes info
  const waiting: DeriveStakingWaitingWithCmixId = await api.derive.staking.waitingInfo(stakingQueryFlags);

  // Get staking info for active validators
  // const validatorAddresses = await api.query.session.validators();
  // const validators: DeriveStakingQueryWithCmixId[] = await api.derive.staking.queryMulti(validatorAddresses, stakingQueryFlags);

  //console.log(JSON.stringify(waiting.info[0].stashId, null, 2));
  //console.log(JSON.stringify(validators[0], null, 2));
  waiting.info.map((validator) => console.log(transformCmixAddress(validator.stakingLedger.cmixId)));
  waiting.info.map((validator) => console.log(validator.stakingLedger.cmixId.toString()));
}

main().catch(console.error).finally(() => process.exit());
