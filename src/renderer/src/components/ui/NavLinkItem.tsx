import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority";
import { SidebarNavGroupProps } from "../sidebar/SidebarNavGroup";
import { Text } from "../dash-ui-kit-enxtended";

const navLinkStyles = cva(
  `
    flex
    items-center
    gap-3.75
    px-3.75
    py-2.5
    border-b-1
    border-white dark:border-white/12
    transition-[bg,scale,translate,shadow]
    duration-300
    ease-out
    group
    cursor-pointer
  `,
  {
    variants: {
      isActive: {
        true: 'bg-dash-brand',
        false: 'dash-block'
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
    transition-[bg,scale,translate,shadow]
    duration-300
    ease
  `,
  {
    variants: {
      isActive: {
        true: 'bg-white/12 text-white',
        false: `
        dash-subtle
        dash-text-default
        group-hover:bg-dash-brand/20 dark:group-hover:bg-dash-mint/15
        group-hover:text-dash-brand dark:group-hover:text-dash-mint
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
    transition-[text,translate]
    duration-300
    ease
  `,
  {
    variants: {
      isActive: {
        true: 'text-white !font-extrabold',
        false: `
        group-hover:text-dash-brand dark:group-hover:text-dash-mint
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
              <Icon color={"inherit"} className={`transition-transform duration-200 ${!isActive ? 'group-hover:scale-105' : ''}`} />
            </div>
          )}
          <Text size={14} color={"brand"} className={textStyles({ isActive })}>
            {item?.items.label}
          </Text>
        </>
      )}
    </NavLink>
  )
}
