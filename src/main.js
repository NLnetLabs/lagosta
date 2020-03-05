import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import i18n from "./i18n";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSignOutAlt, faDownload, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import(/* webpackPreload: true */ "typeface-lato/index.css");
import(/* webpackPreload: true */ "typeface-source-code-pro/index.css");
import VueClipboard from "vue-clipboard2";
import IdleVue from "idle-vue";

import "prismjs";
import "prismjs/themes/prism.css";
import VuePrismEditor from "vue-prism-editor";
import "vue-prism-editor/dist/VuePrismEditor.css"; // import the styles

Vue.component("prism-editor", VuePrismEditor);

Vue.use(VueClipboard);

library.add({
  faSignOutAlt,
  faDownload,
  faClipboard
});
Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

const eventsHub = new Vue();

Vue.use(IdleVue, {
  eventEmitter: eventsHub,
  idleTime: 30 * 60 * 1000 // 30 minutes idle timeout
});

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
