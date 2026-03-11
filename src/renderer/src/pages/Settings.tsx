import { settingsPages } from "@renderer/constants"
import SettingsMainPage from "../components/pages/settings/MainPage";

export default function Settings(): React.JSX.Element {
  const data = settingsPages

  return (
    <SettingsMainPage data={data} />
  )
}
