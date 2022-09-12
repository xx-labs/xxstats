<template>
  <div>
    <h6 id="performance-chart-title" v-b-tooltip.hover class="text-center">
      {{ $t('components.relative_performance_chart.title') }}
      <font-awesome-icon
        icon="question-circle"
        class="d-inline-block"
        style="font-size: 1rem"
      />
    </h6>
    <LineChart :data="chartData" :options="chartOptions" :height="200" />
    <b-tooltip target="performance-chart-title" placement="top">
      {{ $t('components.dashboard_performance.help') }}
      <a
        href="https://research.web3.foundation/en/latest/polkadot/economics/1-validator-selection.html"
        target="_blank"
        class="text-white"
      >
        https://research.web3.foundation/en/latest/polkadot/economics/1-validator-selection.html
      </a>
    </b-tooltip>
  </div>
</template>
<script>
import LineChart from '@/components/charts/LineChart.js'

export default {
  components: {
    LineChart,
  },
  props: {
    relativePerformanceHistory: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        legend: {
          display: false,
        },
        // title: {
        //   display: true,
        //   text: this.$t('components.relative_performance_chart.title'),
        //   fontSize: 18,
        //   fontColor: '#000',
        //   fontStyle: 'lighter',
        // },
        tooltips: {
          backgroundColor: '#000000',
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: true,
                color: 'rgba(200, 200, 200, 0.4)',
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
              },
              gridLines: {
                display: true,
                color: 'rgba(200, 200, 200, 0.4)',
              },
            },
          ],
        },
      },
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.relativePerformanceHistory.map(({ era }) => era),
        datasets: [
          {
            labels: this.$t(
              'components.relative_performance_chart.relative_performance'
            ),
            data: this.relativePerformanceHistory.map(
              ({ relativePerformance }) => relativePerformance * 100
            ),
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(230, 0, 122, 0.8)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            fill: false,
            showLine: true,
          },
        ],
      }
    },
  },
}
</script>
