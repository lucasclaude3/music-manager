import Vue from 'vue';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import VueSVGIcon from 'vue-svgicon';

import '@/assets/scss/main.scss';

import App from './App';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.use(BootstrapVue);
Vue.use(VueSVGIcon);
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>',
}).$mount('#app');
