import { Select, Text } from '@renderer/components/dash-ui-kit-enxtended'
import { Input } from '@renderer/components/dash-ui-kit-enxtended/input'
import { Currency } from '@renderer/hooks/useCurrencySelector'
import { SelectOption } from '@renderer/components/dash-ui-kit-enxtended/select'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onMax: () => void
  selectedCurrency?: Currency
  currencies: Currency[]
  onSelectCurrency: (currencyId: string) => void
}

export default function AmountInput({
  value,
  onChange,
  onMax,
  selectedCurrency,
  currencies,
  onSelectCurrency
}: AmountInputProps) {

  const currencyOptions: SelectOption[] = currencies.map((currency) => ({
    value: currency.id,
    label: currency.id,
    content: (
      <div className={"flex items-center justify-center size-4 rounded-full dash-block-accent"}>
        <currency.icon className={"dash-text-inverse size-full p-[.1875rem]"} />
      </div>
    )
  }))

  return (
    <div className={"flex items-end gap-[.75rem]"}>
      <div className={"relative"}>
        <Input
          type={"text"}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, '')
            const parts = val.split('.')
            if (parts.length > 2) return
            onChange(val)
          }}
          variant={"border-bottom"}
          colorScheme={"transparent"}
          size={"2xl"}
          className={"!text-[2rem] font-bold leading-[120%] pr-13 text-center"}
          placeholder={"0"}
        />
        {onMax && (
          <button
            onClick={onMax}
            className={"absolute right-[.75rem] top-1/2 -translate-y-1/2 px-[.5rem] py-[.25rem] rounded-[.25rem] dash-block-accent-5 flex"}
          >
            <Text size={12} weight={"medium"} color={"blue"} className={"leading-[120%]"}>
              Max
            </Text>
          </button>
        )}
      </div>

      <div className={"relative w-fit h-fit"}>
        <Input
          type={"text"}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, '')
            const parts = val.split('.')
            if (parts.length > 2) return
            if (parts[1] && parts[1].length > 2) return
            onChange(val)
          }}
          variant={"border-bottom"}
          colorScheme={"transparent"}
          className={"!text-[1rem] !w-fit font-medium leading-[120%] pl-[.5rem] pr-13 py-[.4063rem] !text-dash-primary-dark-blue/35 dark:!text-white/35"}
          placeholder="0"
          size={"custom"}
          inputSize={5}
        />
        <div className={"absolute right-[.25rem] top-1/2 -translate-y-1/2"}>
          <Select
            value={selectedCurrency?.id}
            onChange={onSelectCurrency}
            options={currencyOptions}
            border={false}
            animated={true}
            defaultClassName={"flex items-center gap-[.25rem] !p-[.25rem] rounded-[1.5rem] dash-block-5 flex w-full focus:!outline-none focus:!ring-0 cursor-pointer hover:opacity-80 transition-opacity duration-200"}
            defaultItemClassName={`dash-block-5 w-full !outline-none !ring-0 p-1 cursor-pointer hover:opacity-80 transition-opacity duration-200
              [&>*:first-child]:flex
              [&>*:first-child]:items-center
              [&>*:first-child]:justify-center
            `}
            defaultContentClassName={"rounded-[0.5rem] w-full !min-w-[var(--radix-select-trigger-width)] overflow-hidden"}
            defaultIconClassName={"text-dash-primary-dark-blue dark:text-white"}
          />
        </div>
      </div>
    </div>
  )
}
