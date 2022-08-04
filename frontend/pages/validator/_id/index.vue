<template>
  <div class="page validator-page container pt-3">
    <div v-if="loading || !validator">
      <Loading />
    </div>
    <div v-else>
      <b-row v-if="config.showValSelectorInPage">
        <b-col offset="9" cols="3">
          <b-dropdown
            id="selected-validators"
            ref="selectedValidators"
            class="selected-validators"
            toggle-class="btn btn-block btn-selected mb-3"
            right
          >
            <template #button-content>
              <span v-if="loading">{{
                capitalize($t('pages.validator.selected'))
              }}</span>
              <span v-else>
                {{ selectedValidatorAddresses.length }}/{{
                  config.validatorSetSize
                }}
                {{ $t('pages.validator.selected') }}
              </span>
              <font-awesome-icon icon="hand-paper" />
            </template>
            <SelectedValidators />
          </b-dropdown>
        </b-col>
      </b-row>
      <div class="row">
        <div class="col-10">
          <h1 class="mt-3">
            <Identicon :address="accountId" :size="64" />
            <span v-if="validator.name">
              {{ validator.name }}
              <verified-icon v-if="validator.verifiedIdentity" size="lg" />
            </span>
            <span v-else>
              {{ shortAddress(accountId) }}
            </span>
          </h1>
          <h4 v-if="validator.cmixId">
            <a
              :href="`https://dashboard.xx.network/nodes/${validator.dashboardInfo.base64Url}`"
              target="_blank"
              class="badge badge-pill badge-info"
              >Dashboard</a
            >
          </h4>
          <p><ValidatorLinks :account-id="accountId" /></p>
        </div>
        <div class="col-2 text-right mt-4">
          <a
            v-b-tooltip.hover
            class="select"
            title="Select / Unselect validator"
            @click="toggleSelected(validator.stashAddress)"
          >
            <font-awesome-icon
              v-if="isSelected(validator.stashAddress)"
              icon="check-square"
              class="selected fa-2x text-success"
            />
            <font-awesome-icon
              v-else
              icon="square"
              class="unselected fa-2x text-light"
            />
          </a>
        </div>
      </div>
      <b-card class="mb-4">
        <div v-if="validator.stashAddress" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.stash') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <Identicon :address="validator.stashAddress" :size="20" />
            <nuxt-link :to="localePath(`/account/${validator.stashAddress}`)">
              {{ shortAddress(validator.stashAddress) }}
            </nuxt-link>
          </div>
        </div>
        <div v-if="validator.controllerAddress" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.controller') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <Identicon :address="validator.controllerAddress" :size="20" />
            <nuxt-link
              :to="localePath(`/account/${validator.controllerAddress}`)"
            >
              {{ shortAddress(validator.controllerAddress) }}
            </nuxt-link>
          </div>
        </div>
        <div v-if="validator.cmixId" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.cmix_id') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <a
              :href="`https://dashboard.xx.network/nodes/${validator.dashboardInfo.base64Url}`"
              target="_blank"
            >
              {{ validator.cmixId }}
            </a>
          </div>
        </div>
        <div v-if="validator.location" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.location') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            {{ validator.location }}
          </div>
        </div>
        <!-- stake -->
        <div v-if="validator.selfStake" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.own_stake') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <span class="amount">{{
              formatAmount(validator.selfStake, 3, true)
            }}</span>
          </div>
        </div>
        <div v-if="validator.selfStake" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.other_stake') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <span class="amount">{{
              formatAmount(validator.otherStake, 3, true)
            }}</span>
          </div>
        </div>
        <div v-if="validator.totalStake" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.total_stake') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <span class="amount">{{
              formatAmount(validator.totalStake, 3, true)
            }}</span>
          </div>
        </div>
        <div v-if="validator.commission" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.commission') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <span class="amount">{{ validator.commission }}%</span>
          </div>
        </div>
        <!-- session keys -->
        <div v-if="validator.sessionIds" class="row">
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.session_ids') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <p
              v-for="sessionId in validator.sessionIds"
              :key="sessionId"
              class="mb-0"
            >
              {{ sessionId }}
            </p>
          </div>
        </div>
        <div
          v-if="
            JSON.stringify(validator.sessionIds) !==
            JSON.stringify(validator.nextSessionIds)
          "
          class="row"
        >
          <div class="col-md-3 mb-1">
            <strong>{{ $t('details.validator.next_session_ids') }}</strong>
          </div>
          <div class="col-md-9 mb-1 fee">
            <p
              v-for="sessionId in validator.nextSessionIds"
              :key="sessionId"
              class="mb-0"
            >
              {{ sessionId }}
            </p>
          </div>
        </div>
        <!-- identity start -->
        <div v-if="validator.identity.email" class="row">
          <div class="col-md-3 mb-2">
            <strong>{{ $t('details.validator.email') }}</strong>
          </div>
          <div class="col-md-9 mb-2 fee">
            <a :href="`mailto:${validator.identity.email}`" target="_blank">
              {{ validator.identity.email }}
            </a>
          </div>
        </div>
        <div v-if="validator.identity.legal" class="row">
          <div class="col-md-3 mb-2">
            <strong>{{ $t('details.validator.legal') }}</strong>
          </div>
          <div class="col-md-9 mb-2 fee">
            {{ validator.identity.legal }}
          </div>
        </div>
        <div v-if="validator.identity.riot" class="row">
          <div class="col-md-3 mb-2">
            <strong>{{ $t('details.validator.riot') }}</strong>
          </div>
          <div class="col-md-9 mb-2 fee">
            <a
              :href="`https://riot.im/app/#/user/${validator.identity.riot}`"
              target="_blank"
            >
              {{ validator.identity.riot }}
            </a>
          </div>
        </div>
        <div v-if="validator.identity.twitter" class="row">
          <div class="col-md-3 mb-2">
            <strong>Twitter</strong>
          </div>
          <div class="col-md-9 mb-2 fee">
            <a
              :href="`https://twitter.com/${validator.identity.twitter}`"
              target="_blank"
            >
              {{ validator.identity.twitter }}
            </a>
          </div>
        </div>
        <div v-if="validator.identity.web" class="row">
          <div class="col-md-3 mb-2">
            <strong>Web</strong>
          </div>
          <div class="col-md-9 mb-2 fee">
            <a :href="validator.identity.web" target="_blank">
              {{ validator.identity.web }}
            </a>
          </div>
        </div>
        <!-- identity end -->
      </b-card>
      <b-tabs content-class="py-4">
        <b-tab :title="$t('pages.validator.metrics')" active>
          <div class="row pt-4">
            <div class="col-md-6 mb-5">
              <Identity
                :identity="validator.identity"
                :rating="validator.identityRating"
              />
            </div>
            <div class="col-md-6 mb-5">
              <Address
                :account-id="validator.stashAddress"
                :identity="validator.identity"
                :rating="validator.addressCreationRating"
                :created-at-block="validator.stashAddressCreationBlock"
                :parent-created-at-block="
                  validator.stashParentAddressCreationBlock
                "
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-5">
              <Slashes
                :slashes="validator.slashes"
                :rating="validator.slashRating"
              />
            </div>
            <div class="col-md-6 mb-5">
              <Subaccounts
                :rating="validator.subAccountsRating"
                :cluster-members="validator.clusterMembers"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-5">
              <Nominators
                :nominators="validator.nominators"
                :rating="validator.nominatorsRating"
              />
            </div>
            <div class="col-md-6 mb-5">
              <EraPoints
                :percent="validator.eraPointsPercent"
                :average="eraPointsAveragePercent"
                :era-points-history="validator.eraPointsHistory"
                :rating="validator.eraPointsRating"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-5">
              <Commission
                :commission="validator.commission"
                :commission-history="validator.commissionHistory"
                :rating="validator.commissionRating"
              />
            </div>
            <div class="col-md-6 mb-5">
              <Payouts
                :payout-history="validator.payoutHistory"
                :rating="validator.payoutRating"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-5">
              <Governance
                :council-backing="validator.councilBacking"
                :active="validator.activeInGovernance"
                :rating="validator.governanceRating"
              />
            </div>
            <div class="col-md-6 mb-5">
              <Thousand
                v-if="validator.includedThousandValidators"
                :account-id="validator.stashAddress"
                :thousand="validator.thousandValidator"
              />
            </div>
          </div>
        </b-tab>
        <b-tab :title="$t('pages.validator.charts')">
          <div class="row">
            <div class="col-xl-6 pb-4">
              <RelativePerformanceChart
                :relative-performance-history="
                  validator.relativePerformanceHistory
                "
              />
            </div>
            <div class="col-xl-6 pb-4">
              <EraPointsChart
                :era-points-history="validator.eraPointsHistory"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-xl-6 pb-4">
              <PayoutsChart :payout-history="validator.payoutHistory" />
            </div>
            <div class="col-xl-6 pb-4">
              <StakeChart :stake-history="validator.stakeHistory" />
            </div>
          </div>
          <div class="row">
            <div class="col-xl-6 pb-4">
              <CommissionChart
                :commission-history="validator.commissionHistory"
              />
            </div>
            <div class="col-xl-6 pb-4"></div>
          </div>
        </b-tab>
        <b-tab :title="$t('pages.validator.nominations')">
          <Nominations :nominations="validator.nominations" />
        </b-tab>
        <b-tab :title="$t('pages.validator.dashboard_info.title')">
          <h5
            v-if="validator.dashboardInfo.description"
            class="mt-3 mb-2 text-primary2"
          >
            {{ $t('pages.validator.dashboard_info.description') }}
          </h5>
          <p class="mb-0">
            {{ validator.dashboardInfo.description }}
          </p>

          <h5 class="mt-3 mb-2 text-primary2">
            {{ $t('pages.validator.dashboard_info.location') }}
          </h5>
          <p v-if="validator.dashboardInfo.location" class="mb-0">
            {{ validator.dashboardInfo.location }}
          </p>
          <p v-if="validator.dashboardInfo.geoBin" class="mb-0">
            {{ validator.dashboardInfo.geoBin }}
          </p>
          <p v-if="validator.dashboardInfo.gpsLocation" class="mb-0">
            <a
              target="_blank"
              :href="`https://www.google.com/maps/@${
                validator.dashboardInfo.gpsLocation.split(', ')[0]
              },${validator.dashboardInfo.gpsLocation.split(', ')[1]},11z`"
              >{{ validator.dashboardInfo.gpsLocation }}</a
            >
          </p>

          <h5
            v-if="
              validator.dashboardInfo.team !== '' ||
              validator.dashboardInfo.network !== '' ||
              validator.dashboardInfo.email !== '' ||
              validator.dashboardInfo.twitter !== '' ||
              validator.dashboardInfo.discord !== '' ||
              validator.dashboardInfo.instagram !== '' ||
              validator.dashboardInfo.medium !== '' ||
              validator.dashboardInfo.other !== '' ||
              validator.dashboardInfo.forum !== ''
            "
            class="mt-3 mb-2 text-primary2"
          >
            {{ $t('pages.validator.dashboard_info.social') }}
          </h5>
          <div v-if="validator.dashboardInfo.team" class="row">
            <div class="col-xl-4">
              <strong>Team:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.team }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.network" class="row">
            <div class="col-xl-4">
              <strong>Network:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.network }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.email" class="row">
            <div class="col-xl-4">
              <strong>Email:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.email }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.twitter" class="row">
            <div class="col-xl-4">
              <strong>Twitter:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.twitter }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.discord" class="row">
            <div class="col-xl-4">
              <strong>Discord:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.discord }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.instagram" class="row">
            <div class="col-xl-4">
              <strong>Instagram:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.instagram }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.medium" class="row">
            <div class="col-xl-4">
              <strong>Medium:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.medium }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.other" class="row">
            <div class="col-xl-4">
              <strong>Other:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.other }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.forum" class="row">
            <div class="col-xl-4">
              <strong>Forum:</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.forum }}
            </div>
          </div>

          <h5
            v-if="validator.dashboardInfo.whois"
            class="mt-3 mb-2 text-primary2"
          >
            {{ $t('pages.validator.dashboard_info.internet_provider') }}
          </h5>
          <p class="mb-0">
            {{ validator.dashboardInfo.whois }}
          </p>

          <h5 class="mt-3 mb-2 text-primary2">
            {{ $t('pages.validator.dashboard_info.performance') }}
          </h5>
          <div v-if="validator.dashboardInfo.status" class="row">
            <div class="col-xl-4">
              <strong>Status</strong>
            </div>
            <div class="col-xl-8">
              <font-awesome-icon
                v-if="validator.dashboardInfo.status === 'online'"
                icon="circle"
                class="text-success"
              />
              <font-awesome-icon v-else icon="circle" class="text-danger" />
              {{ capitalize(validator.dashboardInfo.status) }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.uptime" class="row">
            <div class="col-xl-4">
              <strong>Uptime</strong>
            </div>
            <div class="col-xl-8">{{ validator.dashboardInfo.uptime }}%</div>
          </div>
          <div v-if="validator.dashboardInfo.roundFailureAvg" class="row">
            <div class="col-xl-4">
              <strong>Round failure average</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.roundFailureAvg }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.realtimeFailureAvg" class="row">
            <div class="col-xl-4">
              <strong>Realtime failure average</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.realtimeFailureAvg }}
            </div>
          </div>
          <div v-if="validator.dashboardInfo.precompFailureAvg" class="row">
            <div class="col-xl-4">
              <strong>Precomp failure average</strong>
            </div>
            <div class="col-xl-8">
              {{ validator.dashboardInfo.precompFailureAvg }}
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import commonMixin from '@/mixins/commonMixin.js'
import SelectedValidators from '@/components/staking/SelectedValidators.vue'
import Identity from '@/components/staking/validator/metrics/Identity.vue'
import Address from '@/components/staking/validator/metrics/Address.vue'
import Slashes from '@/components/staking/validator/metrics/Slashes.vue'
import Subaccounts from '@/components/staking/validator/metrics/Subaccounts.vue'
import Nominators from '@/components/staking/validator/metrics/Nominators.vue'
import EraPoints from '@/components/staking/validator/metrics/EraPoints.vue'
import Commission from '@/components/staking/validator/metrics/Commission.vue'
import Payouts from '@/components/staking/validator/metrics/Payouts.vue'
import Governance from '@/components/staking/validator/metrics/Governance.vue'
import Thousand from '@/components/staking/validator/metrics/Thousand.vue'
import RelativePerformanceChart from '@/components/staking/validator/charts/RelativePerformanceChart.vue'
import EraPointsChart from '@/components/staking/validator/charts/EraPointsChart.vue'
import PayoutsChart from '@/components/staking/validator/charts/PayoutsChart.vue'
import StakeChart from '@/components/staking/validator/charts/StakeChart.vue'
import CommissionChart from '@/components/staking/validator/charts/CommissionChart.vue'
import Nominations from '@/components/staking/validator/Nominations.vue'
import ValidatorLinks from '@/components/staking/validator/ValidatorLinks.vue'
import { config } from '@/frontend.config.js'

export default {
  components: {
    SelectedValidators,
    Identity,
    Address,
    Slashes,
    Subaccounts,
    Nominators,
    EraPoints,
    Commission,
    Payouts,
    Governance,
    Thousand,
    RelativePerformanceChart,
    EraPointsChart,
    PayoutsChart,
    StakeChart,
    CommissionChart,
    Nominations,
    ValidatorLinks,
  },
  mixins: [commonMixin],
  data() {
    return {
      config,
      accountId: this.$route.params.id,
      polling: null,
      validator: null,
      blockHeight: null,
    }
  },
  head() {
    return {
      title: this.$t('pages.validator.head_title', {
        networkName: config.name,
        address: this.accountId,
      }),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('pages.validator.head_content', {
            networkName: config.name,
            address: this.accountId,
          }),
        },
      ],
    }
  },
  computed: {
    loading() {
      return this.$store.state.ranking.loading
    },
    selectedValidatorAddresses() {
      return this.$store.state.ranking.selectedAddresses
    },
    eraPointsAveragePercent() {
      return this.$store.state.ranking.eraPointsAverage
    },
  },
  methods: {
    isSelected(accountId) {
      return this.selectedValidatorAddresses.includes(accountId)
    },
    toggleSelected(accountId) {
      this.$store.dispatch('ranking/toggleSelected', { accountId })
    },
  },
  apollo: {
    $subscribe: {
      validator: {
        query: gql`
          subscription validator($stashAddress: String) {
            ranking(
              where: { stash_address: { _eq: $stashAddress } }
              order_by: { block_height: asc }
              limit: 1
            ) {
              active
              active_eras
              active_in_governance
              active_rating
              address_creation_rating
              cluster_members
              cluster_name
              commission
              commission_history
              commission_rating
              controller_address
              council_backing
              era_points_history
              era_points_percent
              era_points_rating
              governance_rating
              has_sub_identity
              identity
              identity_rating
              included_thousand_validators
              name
              nominators
              nominators_rating
              nominations
              other_stake
              part_of_cluster
              payout_history
              payout_rating
              performance
              rank
              relative_performance
              relative_performance_history
              self_stake
              stake_history
              slash_rating
              slashed
              slashes
              stash_address
              stash_address_creation_block
              stash_parent_address_creation_block
              sub_accounts_rating
              thousand_validator
              total_rating
              total_stake
              verified_identity
              cmix_id
              cmix_id_hex
              location
              dashboard_info
              session_ids
              next_session_ids
            }
          }
        `,
        variables() {
          return {
            stashAddress: this.accountId,
          }
        },
        skip() {
          return !this.accountId
        },
        result({ data }) {
          const validator = data.ranking[0]
          this.validator = {
            active: validator.active,
            activeEras: validator.active_eras,
            activeInGovernance: validator.active_in_governance,
            activeRating: validator.active_rating,
            addressCreationRating: validator.address_creation_rating,
            clusterMembers: parseInt(validator.cluster_members),
            clusterName: validator.cluster_name,
            commission: parseFloat(validator.commission),
            commissionHistory: JSON.parse(validator.commission_history),
            commissionRating: validator.commission_rating,
            controllerAddress: validator.controller_address,
            councilBacking: validator.council_backing,
            eraPointsHistory: JSON.parse(validator.era_points_history),
            eraPointsPercent: parseFloat(validator.era_points_percent),
            eraPointsRating: validator.era_points_rating,
            governanceRating: validator.governance_rating,
            hasSubIdentity: validator.has_sub_identity,
            identity: JSON.parse(validator.identity),
            identityRating: validator.identity_rating,
            includedThousandValidators: validator.included_thousand_validators,
            name: validator.name,
            nominators: validator.nominators,
            nominatorsRating: validator.nominators_rating,
            nominations: JSON.parse(validator.nominations),
            otherStake: validator.other_stake,
            partOfCluster: validator.part_of_cluster,
            payoutHistory: JSON.parse(validator.payout_history),
            payoutRating: validator.payout_rating,
            performance: parseFloat(validator.performance),
            rank: validator.rank,
            relativePerformance: parseFloat(validator.relative_performance),
            relativePerformanceHistory: JSON.parse(
              validator.relative_performance_history
            ),
            selfStake: validator.self_stake,
            stakeHistory: JSON.parse(validator.stake_history),
            slashRating: validator.slash_rating,
            slashed: validator.slashed,
            slashes: JSON.parse(validator.slashes),
            stashAddress: validator.stash_address,
            stashAddressCreationBlock: validator.stash_address_creation_block,
            stashParentAddressCreationBlock:
              validator.stash_parent_address_creation_block,
            subAccountsRating: validator.sub_accounts_rating,
            thousandValidator: JSON.parse(validator.thousand_validator),
            totalRating: validator.total_rating,
            totalStake: validator.total_stake,
            verifiedIdentity: validator.verified_identity,
            cmixId: validator.cmix_id,
            cmixIdHex: validator.cmix_id_hex,
            location: validator.location,
            dashboardInfo: validator.dashboard_info,
            sessionIds: validator.session_ids,
            nextSessionIds: validator.next_session_ids,
            selected: this.isSelected(validator.stash_address),
          }
        },
      },
    },
  },
}
</script>
