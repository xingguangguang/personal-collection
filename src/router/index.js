import { createRouter, createWebHistory } from 'vue-router';
// import HomeView from '@/views/Tools/HomeView.vue';
import HomePage from '@/views/HomePage/HomePage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/homePage',
    name: 'HomePage',
    component: () => import('@/views/HomePage/HomePage.vue'),
    meta: { viewTransition: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/tools',
    redirect: '/tools/wangEditor',
    component: () => import('@/layout/ToolsAppMain.vue'),
    name: 'tools',
    children: [
      {
        path: 'wangEditor',
        component: () => import('@/views/Tools/WangEditor.vue'),
        name: 'WangEditor',
        meta: { title: '富文本编辑器', viewTransition: true }
      },
      {
        path: 'colorTransform',
        component: () => import('@/views/Tools/ColorTransform.vue'),
        name: 'ColorTransform',
        meta: { title: '颜色转换工具', viewTransition: true }
      },
      {
        path: 'URL2JSON',
        component: () => import('@/views/Tools/URL2JSON.vue'),
        name: 'URL2JSON',
        meta: { title: 'URL参数与JSON互转', viewTransition: true }
      },
      {
        path: 'QRCode',
        component: () => import('@/views/Tools/QRCode.vue'),
        name: 'QRCode',
        meta: { title: '二维码生成' }
      },
      {
        path: 'symmetricEncryption',
        component: () => import('@/views/Tools/SymmetricEncryption.vue'),
        name: 'SymmetricEncryption',
        meta: { title: '对称加密' }
      },
      {
        path: 'asymmetricEncryption',
        component: () => import('@/views/Tools/AsymmetricEncryption.vue'),
        name: 'AsymmetricEncryption',
        meta: { title: '非对称加密' }
      },
      {
        path: 'numberAnalysis',
        component: () => import('@/views/Tools/NumberAnalysis.vue'),
        name: 'NumberAnalysis',
        meta: { title: '数字排序与分析' }
      },
      {
        path: 'perpetualCalendar',
        component: () => import('@/views/Tools/PerpetualCalendar.vue'),
        name: 'PerpetualCalendar',
        meta: { title: '万年历' }
      },
      {
        path: 'gregorian2Lunar',
        component: () => import('@/views/Tools/Gregorian2Lunar.vue'),
        name: 'Gregorian2Lunar',
        meta: { title: '公历农历转换' }
      },
      {
        path: 'ageCalculate',
        component: () => import('@/views/Tools/AgeCalculate.vue'),
        name: 'AgeCalculate',
        meta: { title: '年龄计算器' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
