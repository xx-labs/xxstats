export const config = {
  id: 'xx-network',
  name: 'xx-network',
  tokenSymbol: 'XX',
  tokenDecimals: 9,
  ss58Format: 55,
  coinGeckoDenom: 'xx-network',
  nodeWs: 'wss://mainnet.xxnet.io',
  backendWs: 'wss://xx-network.polkastats.io/graphql',
  backendHttp: 'https://xx-network.polkastats.io/graphql',
  backendAPI: 'https://xx-network.polkastats.io',
  googleAnalytics: '',
  theme: '@/assets/scss/themes/polkastats.scss',
  // ranking
  historySize: 84, // 84 days
  erasPerDay: 1,
  validatorSetSize: 24,
}

export const links = {
  account: [],
  validator: [],
}

export const paginationOptions = [10, 20, 50, 100]
