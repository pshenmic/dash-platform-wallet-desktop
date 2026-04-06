import { Route, Routes } from "react-router-dom"
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
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-wallet" element={<CreateWalletWrapper />} />
      </Routes>
    )
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
