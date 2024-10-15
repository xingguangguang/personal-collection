<template>
  <div>
    <router-view />
  </div>
</template>
<script setup>
import store from '@/store';
import ElementPlus from 'element-plus';
import { onBeforeMount, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

onBeforeMount(() => {
  const Vue = getCurrentInstance().appContext.app;
  Vue.use(ElementPlus);
  Vue.use(store);
  console.log(useRoute(), useRouter());
});
// const route = ref(useRoute());
</script>
