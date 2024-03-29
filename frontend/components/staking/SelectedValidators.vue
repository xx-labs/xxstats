<template>
  <div class="selected-validators">
    <p v-if="loading" class="mb-0 text-center">
      {{ $t('components.selected_validators.loading') }}
    </p>
    <p v-else-if="list.length === 0" class="mb-0 text-center">
      {{ $t('components.selected_validators.no_validators_selected') }}
    </p>
    <div v-else class="row mb-3">
      <div class="col-8">{{ list.length }}/{{ config.validatorSetSize }}</div>
      <div class="col-4 text-right">
        <span
          v-b-tooltip.hover
          v-clipboard:copy="selectedAddressesText"
          title="Copy validator addresses to clipboard"
          @click.stop.prevent="showToast"
        >
          <font-awesome-icon
            icon="paperclip"
            style="color: gray; font-size: 1.5rem; cursor: pointer"
          />
        </span>
      </div>
    </div>
    <div
      v-for="validator in list"
      :key="`selected-validator-${validator.stashAddress}`"
      class="row"
    >
      <div class="col-10 selected-validator">
        <Identicon :address="validator.stashAddress" :size="20" />
        <nuxt-link :to="localePath(`/validator/${validator.stashAddress}`)">
          <span v-if="validator.name">
            {{ validator.name }}
            <VerifiedIcon />
          </span>
          <span v-else>
            {{ shortAddress(validator.stashAddress) }}
          </span>
        </nuxt-link>
      </div>
      <div class="col-2 text-right">
        <a
          v-b-tooltip.hover
          href="#"
          title="Remove"
          class="remove"
          @click.stop.prevent="remove(validator.stashAddress)"
        >
          <font-awesome-icon icon="times" />
        </a>
      </div>
    </div>
    <div v-if="list.length > 0" class="row mt-3 mb-0">
      <div class="col-4">
        <b-button
          variant="danger"
          class="clear btn-block text-center"
          :title="$t('components.selected_validators.clear')"
          @click="clean()"
        >
          <font-awesome-icon icon="trash-alt" />
          {{ $t('components.selected_validators.clear') }}
        </b-button>
      </div>
      <div class="col-4">
        <b-button
          variant="primary2"
          class="clear btn-block text-center"
          :to="localePath(`/staking/dashboard`)"
          :title="$t('components.selected_validators.compare')"
        >
          <font-awesome-icon icon="chart-bar" />
          {{ $t('components.selected_validators.compare') }}
        </b-button>
      </div>
      <div class="col-4">
        <b-button
          variant="primary2"
          class="nominate btn-block text-center"
          to="/nominate"
        >
          <font-awesome-icon icon="arrow-right" />
          {{ $t('components.selected_validators.nominate') }}</b-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { config } from '@/frontend.config.js'
import commonMixin from '@/mixins/commonMixin.js'
export default {
  mixins: [commonMixin],
  data() {
    return {
      config,
    }
  },
  computed: {
    loading() {
      return this.$store.state.ranking.loading
    },
    list() {
      return this.$store.state.ranking.list.filter(({ stashAddress }) =>
        this.selectedAddresses.includes(stashAddress)
      )
    },
    selectedAddresses() {
      return this.$store.state.ranking.selectedAddresses
    },
    selectedAddressesText() {
      return this.selectedAddresses.join('\r\n')
    },
  },
  methods: {
    showToast() {
      this.$bvToast.toast(this.selectedAddressesText, {
        title: 'Addresses copied to clipboard!',
        variant: 'secondary',
        autoHideDelay: 5000,
        appendToast: false,
      })
    },
    remove(accountId) {
      this.$store.dispatch('ranking/toggleSelected', { accountId })
    },
    clean() {
      this.$store.dispatch('ranking/importValidatorSet', [])
    },
  },
}
</script>
