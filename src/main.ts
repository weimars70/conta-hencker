import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { Quasar, Notify, Loading, Dialog } from 'quasar';
import langEs from 'quasar/lang/es';
import router from './router';

// Import Quasar css
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';

// Create Pinia instance with persistence plugin
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Quasar, {
  lang: langEs,
  plugins: {
    Notify,
    Loading,
    Dialog
  }
});

app.mount('#app');