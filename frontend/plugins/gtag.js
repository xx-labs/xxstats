import Vue from 'vue'
import VueGtag from 'vue-gtag'
import { config } from '../frontend.config.js'

Vue.use(VueGtag, {
  config: { id: config.googleAnalytics },
})
