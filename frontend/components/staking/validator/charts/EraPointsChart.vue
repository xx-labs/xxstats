<template>
  <div>
    <h6 class="text-center">
      {{ $t('components.era_points_chart.title') }}
    </h6>
    <LineChart :data="chartData" :options="chartOptions" :height="200" />
  </div>
</template>
<script>
import LineChart from '@/components/charts/LineChart.js'

export default {
  components: {
    LineChart,
  },
  props: {
    eraPointsHistory: {
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
        //   text: this.$t('components.era_points_chart.title'),
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
                suggestedMax: 100,
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
        labels: this.eraPointsHistory.map(({ era }) => era),
        datasets: [
          {
            labels: this.$t('components.era_points_chart.era_points'),
            data: this.eraPointsHistory.map(({ points }) => points),
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
