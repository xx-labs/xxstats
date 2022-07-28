// @ts-check
require('dotenv').config();

export const backendConfig = {
  substrateNetwork: process.env.SUBSTRATE_NETWORK || 'xx-network',
  wsProviderUrl: process.env.WS_PROVIDER_URL || 'ws://substrate-node:9944',
  dashboardApiUrl: process.env.DASHBOARD_API_URL || 'https://dashboard-api.xx.network/v1/nodes',
  postgresConnParams: {
    user: process.env.POSTGRES_USER || 'xxstats',
    host: process.env.POSTGRES_HOST || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'xxstats',
    password: process.env.POSTGRES_PASSWORD || 'xxstats',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  sentryDSN: process.env.SENTRY_DSN || '',
  nodeOptions: process.env.NODE_OPTIONS || '',
  crawlers: [
    {
      name: 'blockListener',
      enabled: !process.env.BLOCK_LISTENER_DISABLE,
      crawler: './built/crawlers/blockListener.js',
      statsPrecision: parseInt(process.env.BACKEND_STATS_PRECISION, 10) || 2,
    },
    {
      name: 'blockHarvester',
      enabled: !process.env.BLOCK_HARVESTER_DISABLE,
      crawler: './built/crawlers/blockHarvester.js',
      apiCustomTypes: process.env.API_CUSTOM_TYPES || '',
      startDelay:
        parseInt(process.env.BLOCK_HARVESTER_START_DELAY_MS, 10) || 10 * 1000,
      mode: process.env.BLOCK_HARVESTER_MODE || 'chunks',
      chunkSize: parseInt(process.env.BLOCK_HARVESTER_CHUNK_SIZE, 10) || 10,
      statsPrecision: parseInt(process.env.BACKEND_STATS_PRECISION, 10) || 2,
      pollingTime:
        parseInt(process.env.BLOCK_LISTENER_POLLING_TIME_MS, 10) ||
        60 * 60 * 1000,
    },
    {
      name: 'ranking',
      enabled: !process.env.RANKING_DISABLE,
      crawler: './built/crawlers/ranking.js',
      startDelay:
        parseInt(process.env.RANKING_START_DELAY_MS, 10) || 15 * 60 * 1000,
      pollingTime:
        parseInt(process.env.RANKING_POLLING_TIME_MS, 10) || 5 * 60 * 1000,
      historySize: 28,
      erasPerDay: 1,
      tokenDecimals: 9,
      featuredTimespan: 60 * 60 * 24 * 7 * 2 * 1000, // 2 weeks
      statsPrecision: parseInt(process.env.BACKEND_STATS_PRECISION, 10) || 2,
    },
    {
      name: 'activeAccounts',
      enabled: !process.env.ACTIVE_ACCOUNTS_DISABLE,
      crawler: './built/crawlers/activeAccounts.js',
      startDelay:
        parseInt(process.env.ACTIVE_ACCOUNTS_START_DELAY_MS, 10) || 60 * 1000,
      chunkSize: parseInt(process.env.ACTIVE_ACCOUNTS_CHUNK_SIZE, 10) || 100,
      pollingTime:
        parseInt(process.env.ACTIVE_ACCOUNTS_POLLING_TIME_MS, 10) ||
        6 * 60 * 60 * 1000, // 6 hours
      statsPrecision: parseInt(process.env.BACKEND_STATS_PRECISION, 10) || 2,
    },
  ],
};
