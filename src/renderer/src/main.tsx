import './assets/styles/base.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from 'dash-ui-kit/react'
import { ToastContainer } from './components/ui/Toast'
import App from './App'
import ThemeToggle from './components/ui/ThemeToggle'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider initialTheme={"light"}>
      <HashRouter>
        <AuthProvider>
          {/* <ThemeToggle /> */}
          <App />
          <ToastContainer />
        </AuthProvider>
    </HashRouter>
    </ThemeProvider>
  </StrictMode>
)
