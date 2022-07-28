export const config = {
  id: 'xx-network',
  name: 'xx-network',
  tokenSymbol: 'XX',
  tokenDecimals: 9,
  ss58Format: 55,
  coinGeckoDenom: 'xx-network',
  nodeWs: 'wss://dev.xx-network.polkastats.io/ws',
  backendWs: 'wss://dev.xx-network.polkastats.io/graphql',
  backendHttp: 'https://dev.xx-network.polkastats.io/graphql',
  backendAPI: 'https://dev.xx-network.polkastats.io',
  googleAnalytics: '',
  theme: '@/assets/scss/themes/xxstats.scss',
  // ranking
  historySize: 28, // TODO: take from api.consts.staking.bondingDuration https://polkadot.js.org/docs/substrate/constants#bondingduration-u32
  erasPerDay: 1,
  validatorSetSize: 16, // TODO: take from api.consts.staking.maxNominations (see https://polkadot.js.org/docs/substrate/constants#maxnominations-u32)
}

export const links = {
  account: [],
  validator: [],
}

export const paginationOptions = [10, 20, 50, 100]
