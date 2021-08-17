import Vue from 'vue'
import App from './App.vue'
// import Cookies from 'js-cookie'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from "./router";
// import 'normalize.css/normalize.css' // a modern alternative to CSS resets
import {resetForm} from "@/utils/index"

Vue.prototype.resetForm = resetForm

Vue.config.productionTip = false
Vue.use(ElementUI);
new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
