<template>
  <div>
    <h6 id="dashboard-performance-title" v-b-tooltip.hover class="text-center">
      {{ $t('components.dashboard_performance.title') }}
      <font-awesome-icon
        icon="question-circle"
        class="d-inline-block"
        style="font-size: 1rem"
      />
    </h6>
    <b-tooltip target="dashboard-performance-title" placement="top">
      {{ $t('components.dashboard_performance.help') }}
      <a
        href="https://research.web3.foundation/en/latest/polkadot/economics/1-validator-selection.html"
        target="_blank"
        class="text-white"
        style="text-decoration: underline"
      >
        <span v-if="$i18n.locale === 'en'">here</span>
        <span v-if="$i18n.locale === 'es'">aquí</span>
      </a>
    </b-tooltip>
    <ReactiveLineChart
      :chart-data="chartData"
      :options="chartOptions"
      class="pb-4"
      :style="
        config.themeVersion === 'dark'
          ? 'height: 400px; background-color: rgba(0, 0, 0, 1)'
          : 'height: 400px; background-color: rgba(255, 255, 255, 1)'
      "
    />
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import { config } from '@/frontend.config.js'
import commonMixin from '@/mixins/commonMixin.js'
import ReactiveLineChart from '@/components/charts/ReactiveLineChart.js'

export default {
  components: {
    ReactiveLineChart,
  },
  mixins: [commonMixin],
  data() {
    return {
      config,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
        },
        tooltips: {
          backgroundColor: '#000000',
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: true,
                color:
                  config.themeVersion === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
              },
              scaleLabel: {
                display: true,
                labelString: 'era',
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                suggestedMin: 0,
                suggestedMax: 1,
              },
              gridLines: {
                display: true,
                color:
                  config.themeVersion === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
              },
              scaleLabel: {
                display: true,
                labelString: this.$t(
                  'components.dashboard_performance.avg_performance'
                ),
              },
            },
          ],
        },
      },
      chartData: null,
      rows: [],
      currentEra: 0,
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
  apollo: {
    $subscribe: {
      currentEra: {
        query: gql`
          subscription total {
            total(where: { name: { _eq: "current_era" } }, limit: 1) {
              count
            }
          }
        `,
        result({ data }) {
          this.currentEra = data.total[0].count
        },
      },
      era_relative_performance_avg: {
        query: gql`
          subscription era_relative_performance_avg($minEra: Int!) {
            era_relative_performance_avg(
              where: { era: { _gte: $minEra } }
              order_by: { era: asc }
            ) {
              era
              relative_performance_avg
            }
          }
        `,
        variables() {
          return {
            minEra: this.currentEra - config.historySize,
          }
        },
        skip() {
          return this.currentEra === 0
        },
        result({ data }) {
          this.rows = data.era_relative_performance_avg
          this.chartData = {
            labels: this.rows.map(({ era }) => era),
            datasets: [
              {
                label: 'network',
                data: [...this.rows.map((row) => row.relative_performance_avg)],
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(23, 162, 184, 0.8)',
                hoverBackgroundColor: 'rgba(255, 255, 255, 0.8)',
                fill: false,
                showLine: true,
              },
            ],
          }
        },
      },
      chain_relative_performance_avg: {
        query: gql`
          subscription era_relative_performance(
            $minEra: Int!
            $validators: [String!]
          ) {
            era_relative_performance(
              order_by: { era: asc }
              where: {
                stash_address: { _in: $validators }
                era: { _gte: $minEra }
              }
            ) {
              era
              relative_performance
            }
          }
        `,
        variables() {
          return {
            minEra: this.currentEra - config.historySize,
            validators: this.chainValidatorAddresses,
          }
        },
        skip() {
          return !this.chartData
        },
        result({ data }) {
          const localChartData = {
            ...this.chartData,
          }
          if (data.era_relative_performance.length > 0) {
            const items = this.eras.map((era) => {
              return (
                data.era_relative_performance
                  .filter((row) => row.era === era)
                  .map((v) => parseFloat(v.relative_performance))
                  .reduce((a, b) => a + b) /
                data.era_relative_performance.filter((row) => row.era === era)
                  .length
              )
            })
            const dataset = {
              id: 'chain',
              label: 'current on-chain validators',
              data: items,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(184, 162, 23, 0.8)',
              hoverBackgroundColor: 'rgba(255, 255, 255, 0.8)',
              fill: false,
              showLine: true,
            }
            if (localChartData?.datasets) {
              if (localChartData.datasets.find(({ id }) => id === 'chain')) {
                const datasetIndex = localChartData.datasets.findIndex(
                  ({ id }) => id === 'chain'
                )
                localChartData.datasets[datasetIndex] = dataset
              } else {
                localChartData.datasets.push(dataset)
              }
            } else {
              localChartData.datasets.push(dataset)
            }
          } else if (localChartData?.datasets) {
            if (localChartData.datasets.find(({ id }) => id === 'chain')) {
              const datasetIndex = localChartData.datasets.findIndex(
                ({ id }) => id === 'chain'
              )
              localChartData.datasets.splice(datasetIndex, 1)
            }
          }
          this.chartData = localChartData
        },
      },
      selected_relative_performance_avg: {
        query: gql`
          subscription era_relative_performance(
            $minEra: Int!
            $validators: [String!]
          ) {
            era_relative_performance(
              order_by: { era: asc }
              where: {
                stash_address: { _in: $validators }
                era: { _gte: $minEra }
              }
            ) {
              era
              relative_performance
            }
          }
        `,
        variables() {
          return {
            minEra: this.currentEra - config.historySize,
            validators: this.selectedValidatorAddresses,
          }
        },
        skip() {
          return !this.chartData
        },
        result({ data }) {
          const localChartData = {
            ...this.chartData,
          }
          if (data.era_relative_performance.length > 0) {
            const items = this.eras.map((era) => {
              return (
                data.era_relative_performance
                  .filter((row) => row.era === era)
                  .map((v) => parseFloat(v.relative_performance))
                  .reduce((a, b) => a + b) /
                data.era_relative_performance.filter((row) => row.era === era)
                  .length
              )
            })
            const dataset = {
              id: 'selected',
              label: 'selected validators',
              data: items,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(184, 23, 102, 0.8)',
              hoverBackgroundColor: 'rgba(255, 255, 255, 0.8)',
              fill: false,
              showLine: true,
            }
            if (localChartData?.datasets) {
              if (localChartData.datasets.find(({ id }) => id === 'selected')) {
                const datasetIndex = localChartData.datasets.findIndex(
                  ({ id }) => id === 'selected'
                )
                localChartData.datasets[datasetIndex] = dataset
              } else {
                localChartData.datasets.push(dataset)
              }
            } else {
              localChartData.datasets.push(dataset)
            }
          } else if (localChartData?.datasets) {
            if (localChartData.datasets.find(({ id }) => id === 'selected')) {
              const datasetIndex = localChartData.datasets.findIndex(
                ({ id }) => id === 'selected'
              )
              localChartData.datasets.splice(datasetIndex, 1)
            }
          }
          this.chartData = localChartData
        },
      },
    },
  },
}
</script>
