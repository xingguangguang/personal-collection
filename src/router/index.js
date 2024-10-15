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
    component: () => import('@/views/HomePage/HomePage.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/tools',
    redirect: '/tools/home',
    component: () => import(/* webpackChunkName: "group-tools" */ '@/layout/ToolsAppMain.vue'),
    name: 'tools',
    children: [
      {
        path: 'home',
        component: () => import('@/views/Tools/HomeView.vue'),
        name: 'Tools',
        meta: { title: '工具首页' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
