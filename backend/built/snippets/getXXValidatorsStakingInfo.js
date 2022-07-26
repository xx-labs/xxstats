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
async function main() {
    const wsProvider = 'ws://116.202.87.211:9944';
    // Initialise the provider to connect to the remote node
    const provider = new api_1.WsProvider(wsProvider);
    // Create the API and wait until ready
    const api = await api_1.ApiPromise.create({ provider });
    /// Get waiting nodes info
    const waiting = await api.derive.staking.waitingInfo(stakingQueryFlags);
    // Get staking info for active validators
    // const validatorAddresses = await api.query.session.validators();
    // const validators: DeriveStakingQueryWithCmixId[] = await api.derive.staking.queryMulti(validatorAddresses, stakingQueryFlags);
    console.log(JSON.stringify(waiting.info[0].stashId, null, 2));
    //console.log(JSON.stringify(validators[0], null, 2));
}
main().catch(console.error).finally(() => process.exit());
