import { Route, Routes } from "react-router-dom"
import TransactionsPage from "./pages/Transactions"
import SendPage from "./pages/Send"
import WithdrawPage from "./pages/Withdraw"
import TokensPage from "./pages/Tokens"
import NamesPage from "./pages/Names"
import SupportPage from "./pages/Support"
import SettingsPage from "./pages/Settings"
import Sidebar from "./components/sidebar"

function App(): React.JSX.Element {
  return (
    <div className="flex">
      <Sidebar />
       <main className="flex-1 min-h-screen overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-12">
        <Routes>
          <Route path={"/"} element={<TransactionsPage />} />
          <Route path={"/send"} element={<SendPage />} />
          <Route path={"/withdraw"} element={<WithdrawPage />} />
          <Route path={"/tokens"} element={<TokensPage />} />
          <Route path={"/names"} element={<NamesPage />} />
          <Route path={"/support"} element={<SupportPage />} />
          <Route path={"/settings"} element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
