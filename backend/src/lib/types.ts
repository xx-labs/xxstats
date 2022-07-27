// @ts-check
import { AnyTuple } from '@polkadot/types/types';
import { GenericExtrinsic } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';

import type { Option, Vec } from '@polkadot/types-codec';
import { DeriveStakingQuery, DeriveStakingWaiting } from '@polkadot/api-derive/staking/types';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { PalletStakingStakingLedger, PalletStakingNominations } from '@polkadot/types/lookup';
import type { DeriveReferendumExt, DeriveCouncilVotes, DeriveProposal } from '@polkadot/api-derive/types';
import type { AccountId32, H256, Block } from '@polkadot/types/interfaces/runtime';
import type { StorageKey } from '@polkadot/types';

export interface CrawlerConfig {
  name: string;
  enabled: boolean;
  crawler: string;
  apiCustomTypes?: string;
  startDelay?: number;
  mode?: string;
  chunkSize?: number;
  statsPrecision?: number;
  pollingTime?: number;
  historySize?: number;
  erasPerDay?: number;
  tokenDecimals?: number;
  featuredTimespan?: number;
}

export interface BackendConfig {
  substrateNetwork: string;
  wsProviderUrl: string;
  postgresConnParams: {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
  };
  logLevel: string;
  sentryDSN: string;
  substrateApiSidecar: string;
  crawlers: CrawlerConfig[];
}

export interface LoggerOptions {
  crawler: string;
}

export interface IdentityInfo {
  verifiedIdentity: boolean;
  hasSubIdentity: boolean;
  name: string;
  identityRating: number;
}

export interface CommisionHistoryItem {
  era: string;
  commission: string;
}

export interface EraPointsHistoryItem {
  era: string;
  points: number;
}

export interface PayoutHistoryItem {
  era: string;
  status: string;
}

export interface PerformanceHistoryItem {
  era: string;
  performance: number;
}

export interface StakeHistoryItem {
  era: string;
  self: string;
  others: string;
  total: string;
}

export interface ClusterInfo {
  clusterName: string;
  clusterMembers: number;
}

export type IndexedBlockEvent = [number, EventRecord];
export type IndexedBlockExtrinsic = [number, GenericExtrinsic<AnyTuple>];

// xx.network
export interface LedgerWithCmixId extends PalletStakingStakingLedger {
  cmixId?: Option<H256>,
}
export interface DeriveStakingQueryWithCmixId extends DeriveStakingQuery {
  stakingLedger: LedgerWithCmixId,
}
export interface DeriveStakingWaitingWithCmixId extends DeriveStakingWaiting {
  info: DeriveStakingQueryWithCmixId[],
}
export type StakingQueries = [
  { block: Block },
  Vec<AccountId32>,
  DeriveStakingWaitingWithCmixId,
  [StorageKey<[AccountId32]>, Option<PalletStakingNominations>][],
  DeriveCouncilVotes,
  DeriveProposal[],
  DeriveReferendumExt[],
];

export interface ValidatorOrIntention {
  info: DeriveStakingQueryWithCmixId,
  active?: Boolean,
  identity?: DeriveAccountRegistration
}
