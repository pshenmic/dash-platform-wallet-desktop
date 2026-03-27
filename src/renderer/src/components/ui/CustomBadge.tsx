import Badge, { BadgeProps } from "../dash-ui-kit-enxtended/badge";

export default function CustomBadge(
  {variant = 'default', text, size = 'xs', className = ''}:
  {variant?: 'default' | 'error' | 'muted', text: string, size?: BadgeProps['size'], className?: string}): React.JSX.Element
{
  const variantBadge: Pick<BadgeProps, 'color' | 'colorLight' | 'colorDark'> = variant === 'default' ?
  {
    colorLight: "blue",
    colorDark: "turquoise",
  }
  : variant === 'error' ?
  {
    color: "red",
  }
  :
  {
    colorLight: "gray",
    colorDark: "white",
  }

  return (
    <Badge {...variantBadge} variant={"flat"} size={size} className={`!text-[.625rem] leading-[120%] ${className}`}>
      {text}
    </Badge>
  )
}
