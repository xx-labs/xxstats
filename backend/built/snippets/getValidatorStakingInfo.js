"use strict";
//
// docker exec backend_crawler_1 node /usr/app/crawler/built/snippets/getValidatorStakingInfo.js
//
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');
async function main() {
    const wsProvider = 'ws://substrate-node:9944';
    const authorityId = '6YJNRiCq8za9aYDFL3nzDZxsE72CqciVDptvirLesDBk4Fks';
    const stakingQueryFlags = {
        withController: true,
        withDestination: false,
        withExposure: true,
        withLedger: true,
        withNominations: false,
        withPrefs: true,
    };
    // Initialise the provider to connect to the remote node
    const provider = new WsProvider(wsProvider);
    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider });
    // Retrieve validator staking information via rpc call
    const validatorStakingInfo = await api.derive.staking.query(authorityId, stakingQueryFlags);
    console.log(JSON.stringify(validatorStakingInfo, null, 2));
}
main().catch(console.error).finally(() => process.exit());
// Response:
// {
//   "accountId": "6YJNRiCq8za9aYDFL3nzDZxsE72CqciVDptvirLesDBk4Fks",
//   "cmixId": "xoFocp7WRMl37IzzGwoMYNOEaaAN8uA5Fd7MeVLQ1LoC",
//   "controllerId": "6YJNRiCq8za9aYDFL3nzDZxsE72CqciVDptvirLesDBk4Fks",
//   "exposure": {
//     "total": 225332201650250,
//     "custody": 0,
//     "own": 11132807263461,
//     "others": [
//       {
//         "who": "6auxyQJjwfnfv1817rvUPeMTMpaNc4EG5swaanDn4MJT9TVq",
//         "value": 140808330837308
//       },
//       {
//         "who": "6YfWhbcRqQahm4YnBbDZrq7gEZgdaCKY1A361nxQjuyY9wJ4",
//         "value": 67049645914121
//       },
//       {
//         "who": "6Yi4KnhMSeJ1NUKQ3RWNeoR2WCHSBiEdzKgzN2tHqngt26uH",
//         "value": 3050354757142
//       },
//       {
//         "who": "6X54kKo4X5LJYcB5oHNhMRJV9FH6z71HFRJTqRNBnRmesGo8",
//         "value": 1939188640817
//       },
//       {
//         "who": "6WkwBYEdMoz46sqgQtDiQ2rVC9hW1fTnnJNvJjD7iXu54fie",
//         "value": 1259504036302
//       },
//       {
//         "who": "6YSSgb15LpdRgf5vSaJvTMt1ADuwbENGh2pRr8nrPwdQe1DF",
//         "value": 70941190375
//       },
//       {
//         "who": "6Zk84WfAm6znorcf6GHaZGzd2WxngDwbvQ9thXKqE1A8A663",
//         "value": 21429010724
//       }
//     ]
//   },
//   "nominators": [],
//   "rewardDestination": null,
//   "stakingLedger": {
//     "stash": "6YJNRiCq8za9aYDFL3nzDZxsE72CqciVDptvirLesDBk4Fks",
//     "total": 11171661877671,
//     "active": 11171661877671,
//     "unlocking": [],
//     "claimedRewards": [
//       162,
//       163,
//       164,
//       165,
//       166,
//       167,
//       168,
//       169,
//       170,
//       171,
//       172,
//       173,
//       174,
//       175,
//       176,
//       177,
//       178,
//       179,
//       180,
//       181,
//       182,
//       183,
//       189,
//       190,
//       191,
//       194,
//       195,
//       196,
//       197,
//       198,
//       200,
//       201,
//       202,
//       203,
//       204,
//       205,
//       206,
//       207,
//       208,
//       209,
//       210,
//       211,
//       212,
//       213,
//       214,
//       215,
//       216,
//       217,
//       218,
//       219,
//       220,
//       221,
//       222,
//       223,
//       224,
//       225,
//       226,
//       227,
//       228,
//       229,
//       230,
//       231,
//       232,
//       233,
//       234,
//       235,
//       236,
//       237,
//       238,
//       239,
//       240,
//       241,
//       242,
//       243,
//       244,
//       245
//     ],
//     "cmixId": "0xc68168729ed644c977ec8cf31b0a0c60d38469a00df2e03915decc7952d0d4ba"
//   },
//   "stashId": "6YJNRiCq8za9aYDFL3nzDZxsE72CqciVDptvirLesDBk4Fks",
//   "validatorPrefs": {
//     "commission": 99900000,
//     "blocked": false
//   }
// }
