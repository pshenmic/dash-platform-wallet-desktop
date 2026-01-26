import { Text } from "dash-ui-kit/react";
import { cva, type VariantProps } from "class-variance-authority";

const typographyVariants = cva(
  '',
  {
    variants: {
      variant: {
        base: 'text-base font-medium leading-[120%]',
        caption: 'text-xs font-light leading-[120%]',
        body: 'text-sm font-medium leading-[120%]',
      }
    },
    defaultVariants: {
      variant: 'body',
    }
  }
)

export interface TypographyProps
  extends React.ComponentProps<typeof Text>,
  VariantProps<typeof typographyVariants> {
  variant?: 'base' | 'caption' | 'body'
}

export function Typography({
  variant,
  className,
  ...props
}: TypographyProps) {
  const variantClasses = typographyVariants({ variant })
  const mergedClasses = className ? `${variantClasses} ${className}`.trim() : variantClasses

  return (
    <Text
      className={mergedClasses}
      {...props}
    />
  );
}
