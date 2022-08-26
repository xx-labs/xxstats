"use strict";
//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/getUtilityBatchExtrinsicCalls.js
//
Object.defineProperty(exports, "__esModule", { value: true });
// Required imports
const api_1 = require("@polkadot/api");
async function main() {
    const wsProvider = 'ws://dev.xx-network.polkastats.io:9944';
    // Initialise the provider to connect to the remote node
    const provider = new api_1.WsProvider(wsProvider);
    // Create the API and wait until ready
    const api = await api_1.ApiPromise.create({ provider });
    const blockNumber = '3716296';
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    const { block } = await api.rpc.chain.getBlock(blockHash);
    // console.log(JSON.stringify(block, null, 2));
    const extrinsic = block.extrinsics[1];
    const humanExtrinsic = extrinsic.toHuman();
    console.log('Calls included in utility.batch extrinsic:');
    const decoratedCalls = humanExtrinsic.method.args.calls.map((call, index) => ({
        section: call.section,
        method: call.method,
        args: extrinsic.method.toJSON().args.calls[index].args,
    }));
    console.log(JSON.stringify(decoratedCalls, null, 2));
}
main().catch(console.error).finally(() => process.exit());
