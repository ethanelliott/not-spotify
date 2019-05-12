import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.prototype.$thisPath = process.env.VUE_APP_ROOT_API

Vue.prototype.$spotify = {
  id: process.env.VUE_APP_SPOTIFY_CLIENT_ID,
  secret: process.env.VUE_APP_SPOTIFY_CLIENT_SECRET
}
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
