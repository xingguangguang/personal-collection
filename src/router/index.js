import { createRouter, createWebHistory } from 'vue-router';
// import HomeView from '@/views/Tools/HomeView.vue';
import HomePage from '@/views/HomePage/HomePage.vue';

const routes = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: HomeView
  // },
  // {
  //   path: '/about',
  //   name: 'about',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // },
  // {
  //   path: '/homePage',
  //   name: 'HomePage',
  //   component: () => import('@/views/HomePage/HomePage.vue')
  // }
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
    name: 'tools',
    component: () => import('@/views/Tools/HomeView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
