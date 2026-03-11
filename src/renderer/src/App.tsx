import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import TransactionsPage from "./pages/Transactions"
import SendPage from "./pages/Send"
import TokensPage from "./pages/Addresses"
import NamesPage from "./pages/Identities"
import SupportPage from "./pages/Support"
import SettingsPage from "./pages/Settings"
import Sidebar from "./components/sidebar"
import LoginPage from "./pages/auth/Login"
import Layout from "./components/Layout"
import { useSystemTheme } from "./hooks/useSystemTheme"
import CreateWalletWrapper from "./pages/auth/CreateWalletWrapper"
import ReceivePage from "./pages/Receive"

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [hasWallet, setHasWallet] = useState<boolean>(false)
  const navigate = useNavigate();
  const location = useLocation();
  // useSystemTheme()

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const handleAddWallet = useCallback(() => {
    setHasWallet(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/create-wallet" element={<CreateWalletWrapper />} />
      </Routes>
    );
  }

  return (
    <div className={"flex"}>
      <Sidebar />
      <Layout>
        <Routes>
          <Route path={"/"} element={<TransactionsPage />} />
          <Route path={"/send"} element={<SendPage />} />
          <Route path={"/receive"} element={<ReceivePage />} />
          <Route path={"/tokens"} element={<TokensPage />} />
          <Route path={"/names"} element={<NamesPage />} />
          <Route path={"/support"} element={<SupportPage />} />
          <Route path={"/settings"} element={<SettingsPage />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
