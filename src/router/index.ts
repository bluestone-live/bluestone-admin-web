import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layout/app-layout.vue'
import Page404Layout from '@/layout/page-404-layout.vue'
import AuthLayout from '@/layout/auth-layout.vue'
import RouteViewComponent from './route-view.vue'
import { useCommonStore } from '@/store/Common.js'
// import { WalletSelector } from '@/services/types'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: { name: 'Dashboard' },
  },
  {
    name: 'Admin',
    path: '/admin',
    component: AppLayout,
    children: [
      {
        name: 'Dashboard',
        path: 'dashboard',
        component: () => import('@/pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'Whitelist',
        path: 'whitelist',
        component: RouteViewComponent,
        children: [
          {
            name: 'Administrator',
            path: 'administrator',
            component: () => import('@/pages/admin/whitelist/administrator/Admin.vue')
          },
          {
            name: 'Lender',
            path: 'lender',
            component: () => import('@/pages/admin/whitelist/lender/Lender.vue')
          },
          {
            name: 'Borrower',
            path: 'borrower',
            component: () => import('@/pages/admin/whitelist/borrower/Borrower.vue')
          },
        ]
      },
      {
        name: 'LoanList',
        path: 'loanlist',
        component: () => import('@/pages/admin/loanlist/LoanList.vue')
      }
    ]
  },
  {
    name: "Auth",
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'Wallet',
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
        name: 'NotFound',
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

router.beforeEach(async (to, from, next) => {
  const commonStore = useCommonStore()
  if (to.name === 'Wallet') { next() } 
  if (commonStore.wallet == 'Disconnect') {
    console.log("commonStore.wallet = ", commonStore.wallet)
    next({ name: "Wallet" })
  } else {
    if (!commonStore.isInited) {
      await commonStore.init()
    }
    next()
  }
})

export default router

