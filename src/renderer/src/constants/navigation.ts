export interface NavItem {
  id: string
  label: string
  to: string
}

export interface NavGroup {
  id: string
  label?: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: 'main',
    items: [
      {
        id: 'transactions',
        label: 'Transactions',
        to: '/'
      },
      {
        id: 'send',
        label: 'Send',
        to: '/send'
      },
      {
        id: 'withdraw',
        label: 'Withdraw',
        to: '/withdraw'
      },
      {
        id: 'tokens',
        label: 'Tokens',
        to: '/tokens'
      },
      {
        id: 'names',
        label: 'Names',
        to: '/names'
      }
    ]
  },
  {
    id: 'secondary',
    items: [
      {
        id: 'support',
        label: 'Support',
        to: '/support'
      },
      {
        id: 'settings',
        label: 'Settings',
        to: '/settings'
      }
    ]
  }
]
