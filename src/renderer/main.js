import Vue from 'vue';
import axios from 'axios';
import dotenv from 'dotenv';
import BootstrapVue from 'bootstrap-vue';
import VueSVGIcon from 'vue-svgicon';
import VModal from 'vue-js-modal';

import '@/assets/scss/main.scss';

import App from './App';
import store from './store';

dotenv.config();

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.use(BootstrapVue);
Vue.use(VueSVGIcon);
Vue.use(VModal);

Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>',
}).$mount('#app');
