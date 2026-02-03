import React from 'react';
import Select, { SelectProps } from '../select';
import { SelectOption } from 'dash-ui-kit/react';

export interface StyledSelectProps extends SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

export const StyledSelect = ({
  options,
  value,
  onChange,
  ...props
}: StyledSelectProps): React.JSX.Element => {
  return (
    <Select
      animated={true}
      openAnimation={"opacity-100 scale-100"}
      closeAnimation={"opacity-0 scale-95"}
      animationDuration={200}
      defaultIconClassName={`
        text-dash-primary-dark-blue
        dark:text-white
        size-5
      `}
      defaultClassName={`
        focus:!outline-none
        focus:!ring-0
        bg-dash-primary-dark-blue/3
        dark:bg-white/4
        text-dash-primary-dark-blue
        dark:text-white
        px-4 py-[.9375rem]
        rounded-[.9375rem]
        hover:bg-dash-brand/20
        dark:hover:bg-dash-mint/15
        hover:scale-102
        hover:shadow-md
        hover:-translate-y-0.5
        data-[state=open]:bg-dash-brand/20
        dark:data-[state=open]:bg-dash-mint/15
        data-[state=open]:scale-102
        data-[state=open]:shadow-md
        data-[state=open]:-translate-y-0.5
        cursor-pointer
        flex items-center gap-[.625rem]
        transition-[bg,scale,translate,shadow] duration-300 ease-out
        group
      `}
      defaultContentClassName={`
        !min-w-[var(--radix-select-trigger-width)]
        bg-white
        dark:bg-gray-800
        dark:border
        dark:border-white/12
        rounded-[.9375rem]
        shadow-lg
        overflow-hidden
        z-50
      `}
      defaultItemClassName={`
        px-4
        py-2.5
        text-dash-primary-dark-blue
        dark:text-white
        cursor-pointer
        transition-colors
        duration-200
        hover:bg-dash-brand/10
        dark:hover:bg-dash-mint/10
        data-[highlighted]:bg-dash-brand/20
        dark:data-[highlighted]:bg-dash-mint/15
        data-[disabled]:opacity-50
        data-[disabled]:cursor-not-allowed
        !outline-none !ring-0
      `}
      {...props}
      className={`focus:outline-none focus:ring-0 ${props.className || ''}`}
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}

export default StyledSelect
