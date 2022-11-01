import Vue from 'vue'
import VueGtag from 'vue-gtag'
import { config } from '../frontend.config.js'

if (config.googleAnalytics !== '') {
  Vue.use(VueGtag, {
    config: { id: config.googleAnalytics },
  })
}
