<template>
  <div class="menu">
    <div
      v-for="item of menuList"
      :key="item.path"
      :class="{ 'menu-item': true, seleted: currentPath === item.path }"
      @click="handleClickMenu(item)"
    >
      <div>{{ item.name }}</div>
    </div>
  </div>
</template>
<script setup name="Menu">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuList = [
  { name: '富文本编辑器', path: '/tools/wangEditor' },
  { name: '颜色转换', path: '/tools/colorTransform' },
  { name: 'URL参数与JSON互转', path: '/tools/URL2JSON' },
  { name: '二维码生成', path: '/tools/QRCode' },
  { name: '对称加密', path: '/tools/symmetricEncryption' },
  { name: '非对称加密', path: '/tools/asymmetricEncryption' },
  { name: '数字排序与分析', path: '/tools/numberAnalysis' },
  { name: '万年历', path: '/tools/perpetualCalendar' },
  { name: '公历农历转换', path: '/tools/gregorian2Lunar' },
  { name: '年龄计算器', path: '/tools/ageCalculate' }
];
const currentPath = ref('/tools/wangEditor');
const handleClickMenu = item => {
  currentPath.value = item.path;
  console.log(router);
  router.push(item.path);
};
</script>
<style scoped lang="less">
.menu {
  display: flex;
  flex-direction: column;
  .menu-item {
    padding: 0.75rem 1rem;
    color: var(--color-text-secondary);
    text-align: left;
    cursor: pointer;
    box-sizing: border-box;
    border-left: 4px solid transparent;
    transition: all var(--transition-base);
    &:hover {
      color: var(--color-text-highlight);
    }
    &.seleted {
      background-color: var(--color-menu-bg-highlight);
      color: var(--color-text-highlight);
      border-left: 4px solid var(--color-menu-accent);
    }
  }
}
</style>
