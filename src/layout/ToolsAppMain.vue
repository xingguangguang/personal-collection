<template>
  <div class="tool-page">
    <div class="side">
      <div class="logo">
        <img
          class="logo-img"
          :class="{ 'animate-logo': isAnimating }"
          src="@/assets/logo.png"
          @click="triggerAnimation"
        />
        <!-- <el-switch
          class="theme-switch"
          v-model="isDark"
        >
          <template #active-action>
            <span class="custom-active-action">T</span>
          </template>
          <template #inactive-action>
            <span class="custom-inactive-action">F</span>
          </template>
        </el-switch> -->
        <el-switch
          class="theme-switch"
          v-model="isDark"
          :active-action-icon="View"
          :inactive-action-icon="Hide"
          @change="handleChangeTheme"
        />
      </div>
      <Menu />
    </div>
    <div class="tool-container">
      <router-view />
    </div>
  </div>
</template>
<script setup>
import Menu from '@/components/ToolMenu.vue';
import store from '@/store';
import ElementPlus from 'element-plus';
import { onBeforeMount, getCurrentInstance, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Hide, View } from '@element-plus/icons-vue';

const router = useRouter();

const isDark = ref(false);

// 定义响应式数据控制动画状态
const isAnimating = ref(false);
// 点击事件处理函数
const triggerAnimation = () => {
  isAnimating.value = true;

  // 动画结束后重置状态
  setTimeout(() => {
    isAnimating.value = false;
    router.push('/');
  }, 1000); // 与CSS动画时长保持一致
};
/** 切换主题 */
const handleChangeTheme = isDark => {
  // document.documentElement.classList.toggle('theme-dark');
  if (isDark) {
    document.documentElement.classList.add('theme-dark');
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('theme-dark');
    document.documentElement.classList.remove('dark');
  }
};

onBeforeMount(() => {
  const Vue = getCurrentInstance().appContext.app;
  Vue.use(ElementPlus);
  Vue.use(store);
  console.log(useRoute(), useRouter());
});
// const route = ref(useRoute());
</script>
<style scoped lang="less">
.tool-page {
  display: flex;
  text-align: left;
  .side {
    width: 200px;
    height: 100vh;
    box-shadow: -5px 0px 20px #9c9c9c;
    user-select: none;
    .logo {
      height: 100px;
      cursor: pointer;
      position: relative;
      .logo-img {
        width: 90px;
        position: relative;
        top: 8px;
        left: 17px;
        transition: transform 1s ease;
        transform-origin: center;
      }
      // 添加动画类
      .animate-logo {
        animation: rotateAndMoveRight 1s ease forwards;
      }

      .theme-switch {
        position: absolute;
        right: 5px;
        top: 0;
      }
    }
  }
  .tool-container {
    padding: 10px;
    width: 500px;
    flex-grow: 1;
    flex-shrink: 1;
  }
}

@keyframes rotateAndMoveRight {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  50% {
    transform: translateX(30px) rotate(90deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}
</style>
