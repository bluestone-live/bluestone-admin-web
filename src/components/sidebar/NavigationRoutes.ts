export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'Dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'Whitelist',
      displayName: 'menu.whitelist',
      meta: {
        icon: 'vuestic-iconset-forms',
      },
      children: [
        {
          name: "Administrator",
          displayName: 'menu.administrator',
        },
        {
          name: 'Lender',
          displayName: 'menu.lender'
        },
        {
          name: 'Borrower',
          displayName: 'menu.borrower'
        },
      ]
    },
    {
      name: 'LoanList',
      displayName: 'menu.loanlist',
      meta: {
        icon: 'vuestic-iconset-tables',
      },
    },
    {
      name: 'Configuration',
      displayName: 'menu.configuration',
      meta: {
        icon: 'vuestic-iconset-settings',
      },
    }
  ],
}
