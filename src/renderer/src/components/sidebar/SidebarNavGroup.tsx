import { NavItem } from "@renderer/constants";
import { IconProps } from "../icons";
import NavLinkItem from "../ui/NavLinkItem";

export interface SidebarNavGroupProps {
  items: NavItem
  icon: React.FC<IconProps>
}

export default function SidebarNavGroup({items}: {items: SidebarNavGroupProps[]}): React.JSX.Element {
  return (
    <nav className={"flex flex-col w-full rounded-15 overflow-hidden [&>a:last-child]:border-b-0"}>
      {items.map((item) => (
        <NavLinkItem key={item.items.id} item={item} />
      ))}
    </nav>
  )
}
