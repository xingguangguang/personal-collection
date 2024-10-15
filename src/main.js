import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// import store from './store';
// import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import less from 'less';

// createApp(App).use(store).use(router).use(ElementPlus).use(less).mount('#app');

const Vue = createApp(App);
Vue.use(router).use(less).mount('#app');
