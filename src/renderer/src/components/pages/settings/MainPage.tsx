import { Heading } from "@renderer/components/dash-ui-kit-enxtended/heading";
import SidebarNavGroup from "../../ui/NavGroup";
import { SettingsPageType } from "@renderer/constants";
import { SettingsIcon, ChainSmallIcon, ShieldSmallIcon, DashIcon } from "../../dash-ui-kit-enxtended/icons";
import { IconProps, QuestionMessageIcon } from "dash-ui-kit/react";

const iconMap: Record<string, React.FC<IconProps>> = {
  'preferences': SettingsIcon,
  'connection-type': ChainSmallIcon,
  'security-privacy': ShieldSmallIcon,
  'help-and-support': QuestionMessageIcon,
  'about-dash-extension': DashIcon,
}

export default function SettingsMainPage({data}: {data: SettingsPageType}): React.JSX.Element {
  return (
    <div className={"px-12 pb-8"}>
      <Heading as={"h1"} size={"xl36"} weight={"medium"} color={"brand-white"} className={"tracking-[-0.03em]"}>{data.main.title}</Heading>
      <div className={"flex flex-col gap-8 mt-8"}>
        {data.main.items.map((item, index) => (
          <div key={index} className={"flex flex-col gap-[.75rem]"}>
            <Heading as={"h2"} size={"sm"} weight={"medium"} color={"brand-white"} className={"tracking-[-0.03em] opacity-50"}>{item.title}</Heading>
            <div className={"flex flex-col "}>
              <SidebarNavGroup
                items={item.items.map((subItem) => ({
                  items: subItem,
                  icon: iconMap[subItem.id],
                  arrow: true
                }))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
