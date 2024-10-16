import { createApp, h } from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import VueSweetAlert2 from 'vue-sweetalert2'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import 'sweetalert2/dist/sweetalert2.min.css'

import './index.scss'
import router from './router'
import { statusColorDirective } from './directives/v-status-color'
// create new app instance
const createNewApp = () => {
  const app = createApp({
    render: () => h(App),
  })
  library.add(fas, fab)

  app.mount('#app')
  app.config.performance = true
}

const initApp = async () => {
  createNewApp()
}

initApp().then(() => {
  // initialized
})
