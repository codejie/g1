import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import RegisterPage from '@/views/auth/RegisterPage.vue'
import UserProfilePage from '@/views/profile/UserProfilePage.vue'
import AgentDashboardPage from '@/views/agent/AgentDashboardPage.vue'
import AgentSessionDetailPage from '@/views/agent/AgentSessionDetailPage.vue'
import FileManager from '@/components/file/FileManager.vue' // Import FileManager

// Workspace Pages
import WorkspacePage from '@/views/workspace/pages/WorkspacePage.vue'
import DeploymentsPage from '@/views/workspace/pages/DeploymentsPage.vue'
import MonetizationPage from '@/views/workspace/pages/MonetizationPage.vue'
import Slide1Page from '@/views/workspace/pages/workspace/slide1.vue'
import Slide2Page from '@/views/workspace/pages/workspace/slide2.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
          path: 'deployments',
          name: 'deployments',
          component: DeploymentsPage,
          meta: { requiresAuth: true },
        },
        {
          path: 'monetization',
          name: 'monetization',
          component: MonetizationPage,
          meta: { requiresAuth: true },
        },
        {
          path: '', // Default child route for '/'
          redirect: '/workspace',
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
      path: '/profile',
      name: 'profile',
      component: UserProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/agents',
      name: 'agent-dashboard',
      component: AgentDashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/agents/:id',
      name: 'agent-session-detail',
      component: AgentSessionDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/files', // File Manager route
      name: 'file-manager',
      component: FileManager,
      meta: { requiresAuth: true },
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
