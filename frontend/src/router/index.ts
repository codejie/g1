import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import RegisterPage from '@/views/auth/RegisterPage.vue'
import WorkspacePage from '@/views/workspace/pages/WorkspacePage.vue'
import Slide1Page from '@/views/workspace/pages/workspace/slide1.vue'
import Slide2Page from '@/views/workspace/pages/workspace/slide2.vue'
import Slide21Page from '@/views/workspace/pages/workspace/slide21.vue'
import Slide3Page from '@/views/workspace/pages/workspace/slide3.vue'
import Slide4Page from '@/views/workspace/pages/workspace/slide4.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: { name: 'workspace' },
      meta: { requiresAuth: true },
      children: [
        {
          path: 'workspace',
          name: 'workspace',
          component: WorkspacePage,
          meta: { requiresAuth: true },
        },
        {
          path: 'workspace/slide1',
          name: 'workspace-slide1',
          component: Slide1Page,
          meta: { requiresAuth: true },
        },
        {
          path: 'workspace/slide2',
          name: 'workspace-slide2',
          component: Slide2Page,
          meta: { requiresAuth: true },
        },
        {
          path: 'workspace/slide21',
          name: 'workspace-slide21',
          component: Slide21Page,
          meta: { requiresAuth: true },
        },
        {
          path: 'workspace/slide3',
          name: 'workspace-slide3',
          component: Slide3Page,
          meta: { requiresAuth: true },
        },
        {
          path: 'workspace/slide4',
          name: 'workspace-slide4',
          component: Slide4Page,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (
    (to.name === 'login' || to.name === 'register') &&
    authStore.isAuthenticated
  ) {
    next('/')
  } else {
    next()
  }
})

export default router
