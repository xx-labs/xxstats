//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/getUtilityBatchExtrinsicCalls.js
//

// Required imports
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Block } from '@polkadot/types/interfaces/runtime';

async function main() {

  const wsProvider = 'ws://dev.xx-network.polkastats.io:9944';

  // Initialise the provider to connect to the remote node
  const provider = new WsProvider(wsProvider);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  const blockNumber = '3716296';

  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  const { block }: { block: Block } = await api.rpc.chain.getBlock(blockHash);
  // console.log(JSON.stringify(block, null, 2));
  const extrinsic = block.extrinsics[1];
  const humanExtrinsic: any = extrinsic.toHuman();

  console.log('Calls included in utility.batch extrinsic:');
  const decoratedCalls = humanExtrinsic.method.args.calls.map((call: any, index: number) => (
    {
      section: call.section,
      method: call.method,
      args: extrinsic.method.toJSON().args.calls[index].args,
    }));
  console.log(JSON.stringify(decoratedCalls, null, 2));

}

main().catch(console.error).finally(() => process.exit());
