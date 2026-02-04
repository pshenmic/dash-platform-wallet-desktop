import { Route, Routes } from "react-router-dom"
import { useCallback, useState } from "react"
import TransactionsPage from "./pages/Transactions"
import SendPage from "./pages/Send"
import WithdrawPage from "./pages/Withdraw"
import TokensPage from "./pages/Tokens"
import NamesPage from "./pages/Names"
import SupportPage from "./pages/Support"
import SettingsPage from "./pages/Settings"
import Sidebar from "./components/sidebar"
import LoginPage from "./pages/Authorization"
import Layout from "./components/Layout"
import { useSystemTheme } from "./hooks/useSystemTheme"

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [hasWallet, setHasWallet] = useState<boolean>(false)
  // useSystemTheme()

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const handleAddWallet = useCallback(() => {
    setHasWallet(true)
  }, [])

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className={"flex"}>
      <Sidebar />
       <Layout hasWallet={hasWallet} onAddWallet={handleAddWallet}>
        <Routes>
          <Route path={"/"} element={<TransactionsPage />} />
          <Route path={"/send"} element={<SendPage />} />
          <Route path={"/withdraw"} element={<WithdrawPage />} />
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
