<template>
  <div class="nominations">
    <div class="table-responsive">
      <b-table
        striped
        hover
        :fields="fields"
        :items="nominations"
        :per-page="perPage"
        :current-page="currentPage"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
      >
        <template #cell(who)="data">
          <p class="mb-0">
            <nuxt-link
              :to="localePath(`/account/${data.item.who}`)"
              :title="$t('pages.accounts.account_details')"
            >
              <Identicon :address="data.item.who" :size="20" />
              {{ shortAddress(data.item.who) }}
            </nuxt-link>
          </p>
        </template>
        <template #cell(value)="data">
          <p class="mb-0">
            {{ formatAmount(data.item.value) }}
          </p>
        </template>
        <template #cell(share)="data">
          <p class="mb-0">{{ getPercentage(data.item.value).toFixed(2) }}%</p>
        </template>
      </b-table>
      <div class="mt-4 d-flex">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="my-table"
          variant="dark"
          align="right"
        ></b-pagination>
        <b-button-group class="ml-2">
          <b-button
            v-for="(item, index) in tableOptions"
            :key="index"
            variant="primary2"
            @click="setPageSize(item)"
          >
            {{ item }}
          </b-button>
        </b-button-group>
      </div>
    </div>
  </div>
</template>

<script>
import { BigNumber } from 'bignumber.js'
import commonMixin from '@/mixins/commonMixin.js'
import Identicon from '@/components/Identicon.vue'
import { config } from '@/frontend.config.js'

export default {
  components: {
    Identicon,
  },
  mixins: [commonMixin],
  props: {
    nominations: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      loading: true,
      sortBy: 'value',
      sortDesc: true,
      tableOptions: config.paginationOptions,
      perPage: localStorage.paginationOptions
        ? parseInt(localStorage.paginationOptions)
        : 10,
      currentPage: 1,
      fields: [
        {
          key: 'who',
          label: this.$t('components.nominations.who'),
        },
        {
          key: 'value',
          label: this.$t('components.nominations.value'),
        },
        {
          key: 'share',
          label: this.$t('components.nominations.share'),
        },
      ],
    }
  },
  computed: {
    totalRows() {
      return this.nominations.length
    },
    totalStake() {
      const totalStake = this.nominations.reduce((accum, nomination) => {
        const current = new BigNumber(nomination.value)
          .div(new BigNumber(10).pow(config.tokenDecimals))
          .toNumber()
        return accum + current
      }, 0)
      // eslint-disable-next-line no-console
      console.log('total stake:', totalStake)
      return totalStake
    },
  },
  methods: {
    setPageSize(num) {
      localStorage.paginationOptions = num
      this.perPage = parseInt(num)
    },
    getPercentage(value) {
      value = new BigNumber(value)
        .div(new BigNumber(10).pow(config.tokenDecimals))
        .toNumber()
      return (value * 100) / this.totalStake
    },
  },
}
</script>
