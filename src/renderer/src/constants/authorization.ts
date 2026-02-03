export interface AuthorizationTexts {
  title: string
  description: string
  form: {
    passwordLabel: string
    passwordPlaceholder: string
    submitButton: string
  }
  links: {
    register: {
      label: string
      to: string
    }
    forgotPassword: {
      label: string
      to: string
    }
  }
}

export const authorizationTexts: AuthorizationTexts = {
  title: 'Welcome Back',
  description: 'Use the password to unlock your wallet.',
  form: {
    passwordLabel: 'Password',
    passwordPlaceholder: 'Type Your Password',
    submitButton: 'Unlock'
  },
  links: {
    register: {
      label: 'Register wallet',
      to: '/'
    },
    forgotPassword: {
      label: 'Forgot password?',
      to: '/'
    },
  },
}
