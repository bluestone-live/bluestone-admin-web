export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'whitelist',
      displayName: 'menu.whitelist',
      meta: {
        icon: 'vuestic-iconset-forms',
      },
      children: [
        {
          name: "administrator",
          displayName: 'menu.administrator',
        },
        {
          name: 'lender',
          displayName: 'menu.lender'
        },
        {
          name: 'borrower',
          displayName: 'menu.borrower'
        },
      ]
    },
    {
      name: 'loanlist',
      displayName: 'menu.loanlist',
      meta: {
        icon: 'vuestic-iconset-tables',
      },
    }
  ],
}
