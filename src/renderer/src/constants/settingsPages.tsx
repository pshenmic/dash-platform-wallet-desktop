export interface SettingsMainPageItem {
  id: string
  label: string
  to: string
}

export interface SettingsMainPage {
  title: string
  items: {
    title: string
    items: SettingsMainPageItem[]
  }[]
}

export interface SettingsPageType {
  main: SettingsMainPage
}

export const settingsPages: SettingsPageType = {
  main: {
    title: 'Settings',
    items: [
      {
        title: 'Wallet Settings',
        items: [
          {
            id: 'preferences',
            label: 'Preferences',
            to: '/'
          },
          {
            id: 'connection-type',
            label: 'Connection Type',
            to: '/'
          },
          {
            id: 'security-privacy',
            label: 'Security & Privacy',
            to: '/'
          }
        ]
      },
      {
        title: 'Other',
        items: [
          {
            id: 'help-and-support',
            label: 'Help and Support',
            to: '/'
          },
          {
            id: 'about-dash-extension',
            label: 'About Dash Extension',
            to: '/'
          },
        ]
      },
    ]
  },
}
