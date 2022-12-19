//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/debugExtrinsicFee.js
//

// Required imports
import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {

  const wsProvider = 'ws://dev.xx.polkastats.io:9944';

  // Initialise the provider to connect to the remote node
  const provider = new WsProvider(wsProvider);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  const block = await api.derive.chain.getBlock('0xa01aa7e1eb4095c96abb1eaca786edcd266c7ef38c8db6508a6e5011938a380d');
  console.log(JSON.stringify(block, null, 2));

  const feeInfo = await api.call.transactionPaymentApi.queryInfo('0x45028400669a0b768bdc34fdbc06e87d7e07659825e12e60a2d8575c88a651fe0f2a427501165e2911d3e569a9187a462b22e90e4dcd6effbae4f6bc7cfea71ba547cb5e5aec363ab3b5c42706a82ac86f954baf9a31e3060e445890b5225dc565a397e78435030400040300e28d1fe54dbb78a0460afee227367705a9da405d9bf8e1a88d2f6974466bba790b00d8998bd603', '0x45028400669a0b768bdc34fdbc06e87d7e07659825e12e60a2d8575c88a651fe0f2a427501165e2911d3e569a9187a462b22e90e4dcd6effbae4f6bc7cfea71ba547cb5e5aec363ab3b5c42706a82ac86f954baf9a31e3060e445890b5225dc565a397e78435030400040300e28d1fe54dbb78a0460afee227367705a9da405d9bf8e1a88d2f6974466bba790b00d8998bd603'.length);
  console.log(JSON.stringify(feeInfo, null, 2));

}

main().catch(console.error).finally(() => process.exit());
