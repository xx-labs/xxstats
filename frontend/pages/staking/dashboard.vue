<template>
  <div class="page-staking-dashboard container pt-3">
    <div>
      <StakingStats />
      <Suggestions :validators="chainValidatorAddresses" />
      <div class="row">
        <div class="col-md-6">
          <DashboardCommission />
        </div>
        <div class="col-md-6">
          <DashboardSelfStake />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <DashboardPerformance />
        </div>
        <div class="col-md-6">
          <DashboardEraPoints />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { config } from '@/frontend.config.js'
import commonMixin from '@/mixins/commonMixin.js'
import StakingStats from '@/components/staking/dashboard/StakingStats.vue'
import Suggestions from '@/components/staking/dashboard/Suggestions.vue'
import DashboardCommission from '@/components/staking/dashboard/charts/DashboardCommission.vue'
import DashboardSelfStake from '@/components/staking/dashboard/charts/DashboardSelfStake.vue'
import DashboardPerformance from '@/components/staking/dashboard/charts/DashboardPerformance.vue'
import DashboardEraPoints from '@/components/staking/dashboard/charts/DashboardEraPoints.vue'
export default {
  components: {
    StakingStats,
    Suggestions,
    DashboardCommission,
    DashboardSelfStake,
    DashboardPerformance,
    DashboardEraPoints,
  },
  mixins: [commonMixin],
  data() {
    return {
      config,
    }
  },
  head() {
    return {
      title: this.$t('pages.staking_dashboard.head_title', {
        networkName: config.name,
      }),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('pages.staking_dashboard.head_content', {
            networkName: config.name,
          }),
        },
      ],
    }
  },
  computed: {
    eras() {
      return this.rows.map((row) => row.era)
    },
    selectedValidatorAddresses() {
      return this.$store.state.ranking.selectedAddresses
    },
    chainValidatorAddresses() {
      return this.$store.state.ranking.chainValidatorAddresses
    },
  },
}
</script>
