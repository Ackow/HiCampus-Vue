import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'
import Publish from '../views/Publish.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/Home.vue'),
          meta: {
            title: 'HiCampus - 嗨校园',
            requiresAuth: true
          }
        },
        {
          path: 'message',
          name: 'Message',
          component: () => import('../views/Message.vue'),
          meta: {
            title: '消息 - HiCampus',
            requiresAuth: true
          }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue'),
          meta: {
            title: '个人资料 - HiCampus',
            requiresAuth: true
          }
        },
        {
          path: 'edit-profile',
          name: 'EditProfile',
          component: () => import('../views/EditProfile.vue'),
          meta: {
            title: '编辑资料 - HiCampus',
            requiresAuth: true
          }
        },
        {
          path: 'post/:id',
          name: 'PostDetail',
          component: () => import('../views/PostDetail.vue'),
          meta: {
            title: '帖子详情 - HiCampus',
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/publish',
      name: 'Publish',
      component: Publish,
      meta: {
        title: '发布 - HiCampus',
        requiresAuth: true
      }
    },
    {
      path: '/login',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'Login',
          component: () => import('../views/RegisterAndLogin.vue'),
          meta: {
            title: '登录/注册 - HiCampus'
          }
        }
      ]
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'HiCampus - 嗨校园'

  // 检查是否需要登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 如果需要登录但未登录，重定向到登录页
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isLoggedIn) {
    // 如果已登录但访问登录页，重定向到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router 