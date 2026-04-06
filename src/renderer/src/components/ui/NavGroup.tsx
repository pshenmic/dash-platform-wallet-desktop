import { NavItem } from "@renderer/constants";
import { IconProps } from "../dash-ui-kit-enxtended/icons";
import NavLinkItem from "./NavLinkItem";

export interface NavGroupProps {
  items: NavItem
  icon: React.FC<IconProps>
  arrow?: boolean
}

export default function NavGroup({items}: {items: NavGroupProps[]}): React.JSX.Element {
  return (
    <nav className={"flex flex-col w-full rounded-[.9375rem] overflow-hidden [&>a:last-child]:border-b-0"}>
      {items.map((item) => (
        <NavLinkItem key={item.items.id} item={item} />
      ))}
    </nav>
  )
}
