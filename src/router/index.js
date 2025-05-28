import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import RegisterAndLogin from '../views/RegisterAndLogin.vue';
import Publish from '../views/Publish.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      showSidebar: true,
      showHeader: true
    },
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../components/Profile.vue'),
        meta: {
          showSidebar: true,
          showHeader: true
        }
      },
      {
        path: 'edit-profile',
        name: 'EditProfile',
        component: () => import('../components/EditProfile.vue'),
        meta: {
          showSidebar: true,
          showHeader: true
        }
      }
    ]
  },
  {
    path: '/register-login',
    name: 'RegisterAndLogin',
    component: RegisterAndLogin,
    meta: {
      showHeader: false
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: {
      showSidebar: false,
      showHeader: true
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;