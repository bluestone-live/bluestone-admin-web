import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layout/app-layout.vue'
import Page404Layout from '@/layout/page-404-layout.vue'
import RouteViewComponent from './route-view.vue'
import { useCommonStore } from "@/store/Common.js"
import pinia from '@/store/index.js'
const commonStore = useCommonStore(pinia)

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: 'dashboard' },
  },
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: Page404Layout },
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
    path: '/404',
    component: Page404Layout,
    children: [
      {
        name: 'not-found-simple',
        path: 'not-found-simple',
        component: () => import('@/pages/404-pages/VaPageNotFoundSimple.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async () => {
  // we wanted to use the store here
  if (!commonStore.isInited) {
    await commonStore.init()
  }
})

export default router
