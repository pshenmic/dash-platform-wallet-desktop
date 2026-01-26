import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority";
import { SidebarNavGroupProps } from "../sidebar/SidebarNavGroup";
import { Typography } from "./Typography";

const navLinkStyles = cva(
  `
    flex
    items-center
    gap-3.75
    px-3.75
    py-2.5
    border-b-1
    border-white
    transition-all
    duration-300
    ease-out
    group
    cursor-pointer
  `,
  {
    variants: {
      isActive: {
        true: 'bg-blue',
        false: 'bg-gray'
      }
    }
  }
)

const iconStyles = cva(
  `
    w-8.75
    h-8.75
    flex
    items-center
    justify-center
    rounded-full
    transition-all
    duration-300
    ease-out
  `,
  {
    variants: {
      isActive: {
        true: 'bg-white/12 text-white',
        false: `
        bg-white
        text-black
        group-hover:bg-blue/20
        group-hover:text-blue
        group-hover:scale-110
        group-hover:shadow-md
        group-hover:-translate-y-0.5
        `
      }
    }
  }
)

const textStyles = cva(
  `
    transition-all
    duration-300
    ease-out
  `,
  {
    variants: {
      isActive: {
        true: 'text-white',
        false: `
        text-black
        group-hover:text-blue
        group-hover:translate-x-1
        `
      }
    }
  }
)

export default function NavLinkItem({item}: {item: SidebarNavGroupProps}): React.JSX.Element {
  const Icon = item?.icon

  return (
    <NavLink
      key={item?.items.id}
      to={item?.items.to}
      className={({ isActive }) => navLinkStyles({ isActive })}
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <div className={iconStyles({ isActive })}>
              <Icon className={"group-hover:scale-105 transition-transform duration-200"} />
            </div>
          )}
          <Typography className={textStyles({ isActive })}>
            {item?.items.label}
          </Typography>
        </>
      )}
    </NavLink>
  )
}
