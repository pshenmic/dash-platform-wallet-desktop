import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import TransactionsPage from "./pages/Transactions"
import SendPage from "./pages/Send"
import Sidebar from "./components/sidebar"
import LoginPage from "./pages/auth/Login"
import Layout from "./components/Layout"
import CreateWalletWrapper from "./pages/auth/CreateWalletWrapper"
import ReceivePage from "./pages/Receive"
import IdentitiesPage from "./pages/Identities"
import AddressesPage from "./pages/Addresses"
import { useAuth } from "./contexts/AuthContext"

function App(): React.JSX.Element {
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const { bootstrapped, isAuthenticated } = useAuth()

  // const navigate = useNavigate();
  // const location = useLocation();
  // useSystemTheme()

  // const handleLogin = useCallback(() => {
  //   setIsAuthenticated(true)
  // }, [])

  // useEffect(() => {
  //   if (!isAuthenticated && location.pathname !== '/') {
  //     navigate('/', { replace: true })
  //   }
  // }, [])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
          <Route path={"/addresses"} element={<AddressesPage />} />
          <Route path={"/identities"} element={<IdentitiesPage />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
