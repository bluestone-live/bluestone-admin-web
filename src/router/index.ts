import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layout/app-layout.vue'
import Page404Layout from '@/layout/page-404-layout.vue'
import AuthLayout from '@/layout/auth-layout.vue'
import RouteViewComponent from './route-view.vue'
import { useCommonStore } from '@/store/Common.js'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/admin',
    component: AppLayout,
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('@/pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'whitelist',
        path: 'whitelist',
        component: RouteViewComponent,
        children: [
          {
            name: 'administrator',
            path: 'administrator',
            component: () => import('@/pages/admin/whitelist/administrator/Admin.vue')
          },
          {
            name: 'lender',
            path: 'lender',
            component: () => import('@/pages/admin/whitelist/lender/Lender.vue')
          },
          {
            name: 'borrower',
            path: 'borrower',
            component: () => import('@/pages/admin/whitelist/borrower/Borrower.vue')
          },
        ]
      },
      {
        name: 'loanlist',
        path: 'loanlist',
        component: () => import('@/pages/admin/loanlist/LoanList.vue')
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'wallet',
        path: 'wallet',
        component: () => import('@/pages/auth/wallet/WalletConnect.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: Page404Layout,
    children: [
      {
        name: 'notfound',
        path: '',
        component: () => import('@/pages/404-pages/VaPageNotFoundSimple.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async () => {
  const commonStore = useCommonStore()
  if (!commonStore.isInited) {
    await commonStore.init()
  }
})

export default router
