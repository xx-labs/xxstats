"use strict";
//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/getXXValidatorsStakingInfo.js
//
Object.defineProperty(exports, "__esModule", { value: true });
// Required imports
const api_1 = require("@polkadot/api");
const stakingQueryFlags = {
    withDestination: false,
    withExposure: true,
    withLedger: true,
    withNominations: false,
    withPrefs: true,
};
const toByteArray = (nodeId) => Buffer.concat([nodeId.toU8a(true), new Uint8Array([2])]);
const toBase64 = (cmixId) => cmixId.toString('base64');
const transformCmixAddress = (nodeId) => ((nodeId === null || nodeId === void 0 ? void 0 : nodeId.isSome) && Number(nodeId) !== 0) ? toBase64(toByteArray(nodeId.unwrap())) : '';
async function main() {
    const wsProvider = 'ws://116.202.87.211:9944';
    // Initialise the provider to connect to the remote node
    const provider = new api_1.WsProvider(wsProvider);
    // Create the API and wait until ready
    const api = await api_1.ApiPromise.create({ provider });
    /// Get waiting nodes info
    const waiting = await api.derive.staking.waitingInfo(stakingQueryFlags);
    const intentions = await Promise.all(waiting.info.map((intention) => api.derive.accounts.info(intention.accountId).then(({ identity }) => ({
        info: intention,
        identity,
        active: false,
    }))));
    // Get staking info for active validators
    // const validatorAddresses = await api.query.session.validators();
    // const validators: DeriveStakingQueryWithCmixId[] = await api.derive.staking.queryMulti(validatorAddresses, stakingQueryFlags);
    //console.log(JSON.stringify(waiting.info[0].stashId, null, 2));
    //console.log(JSON.stringify(validators[0], null, 2));
    intentions.map((validator) => console.log(transformCmixAddress(validator.info.stakingLedger.cmixId)));
    intentions.map((validator) => console.log(validator.info.stakingLedger.cmixId.isSome ? validator.info.stakingLedger.cmixId : ''));
}
main().catch(console.error).finally(() => process.exit());
