import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import RegisterAndLogin from '../views/RegisterAndLogin.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register-login',
    name: 'RegisterAndLogin',
    component: RegisterAndLogin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;