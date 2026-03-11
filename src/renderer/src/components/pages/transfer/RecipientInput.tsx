import { useState, useRef, useEffect } from 'react'
import { Input, Text } from '@renderer/components/dash-ui-kit-enxtended'
import { SearchIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
import { Avatar, Identifier } from 'dash-ui-kit/react'
import { TransferPageType } from '@renderer/constants'

interface AddressBookEntry {
  address: string
  name?: string
  label?: string
}

const MOCK_ADDRESS_BOOK: AddressBookEntry[] = [
  {
    address: '34vkjdeUTP2z798SiXqoB6EAuobh51kXYURqVa9xkujf',
    name: 'Pshenmic.dash',
  },
  {
    address: '34vkjdeUTP2z798SiXqoB6EAuobh51kXYURqVa9xkujf',
    name: 'Pshenmic.dash',
  },
  {
    address: '34vkjdeUTP2z798SiXqoB6EAuobh51kXYURqVa9xkujf',
    name: 'Pshenmic.dash',
  },
  {
    address: '34vkjdeUTP2z798SiXqoB6EAuobh51kXYURqVa9xkujf',
    name: 'Pshenmic.dash',
  },
  {
    address: '34vkjdeUTP2z798SiXqoB6EAuobh51kXYURqVa9xkujf',
    name: 'Pshenmic.dash',
  },
]

interface RecipientInputProps {
  value: string
  onChange: (value: string) => void
  addressBook?: AddressBookEntry[]
  data: TransferPageType['recipient']
}

export default function RecipientInput({
  value,
  onChange,
  addressBook = MOCK_ADDRESS_BOOK,
  data,
}: RecipientInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredAddresses = addressBook.filter(entry =>
    entry.address.toLowerCase().includes(value.toLowerCase()) ||
    entry.name?.toLowerCase().includes(value.toLowerCase())
  )

  const handleFocusChange = (focused: boolean) => {
    setIsFocused(focused)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleFocusChange(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAddress = (address: string) => {
    onChange(address)
    handleFocusChange(false)
  }

  return (
    <div className={"flex flex-col gap-[.625rem] mt-6"}>
      <Text size={16} weight={"medium"} color={"brand"} opacity={50} className={"leading-[120%]"}>
        {data.label}
      </Text>
      <div className={"dash-input-search rounded-[.9375rem] overflow-hidden"}>
        <div
          className={"flex items-center justify-between gap-1 px-6.25 py-5 [&>*:first-child]:flex-1"}
          ref={containerRef}
          onClick={() => {
            handleFocusChange(true)
            inputRef.current?.focus()
          }}
        >
          <Input
            ref={inputRef}
            type={"text"}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onFocus={() => handleFocusChange(true)}
            className={"outline-none text-[.875rem] dash-text-default placeholder:opacity-40 !ring-0 p-0 w-full"}
            placeholder={data.placeholder}
            colorScheme={"transparent"}
            prefixClassName={"flex items-center"}
            prefix={
              <Avatar
                username={"account"}
                className={"size-5"}
              />
            }
          />
          <SearchIcon size={18} className={"dash-text-default opacity-40 shrink-0"} />
        </div>

        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isFocused
              ? 'max-h-145 opacity-100'
              : 'max-h-0 opacity-0'
            }
          `}
          style={{ overflow: 'hidden' }}
        >
          <div className={"px-5"}>
            <div className={"flex items-center justify-between pb-[.75rem]"}>
              <Text size={12} weight={"medium"} color={"brand"} opacity={50}>
                {data.addressBook}:
              </Text>
              <button className={"text-xs dash-block-3 px-[.75rem] py-[.5rem] rounded-[.75rem]"}>
                <Text size={10} weight={"medium"} color={"brand"} className={"leading-[120%]"}>
                  {data.addressManagement}
                </Text>
              </button>
            </div>

            <div className={"max-h-29.25 overflow-y-auto scrollbar-hide flex flex-col gap-[.5rem] pb-[.75rem]"}>
              {filteredAddresses.length > 0 ? (
                filteredAddresses.map((entry, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAddress(entry.address)}
                    className={"w-full p-[.9375rem] dash-block-3 rounded-[.9375rem] flex flex-col gap-[.75rem] cursor-pointer"}
                  >
                    <Identifier
                      highlight={"both"}
                      className={"font-mono text-left"}
                    >
                      {entry.address}
                    </Identifier>
                    {entry.name && (
                      <div className={"flex items-center gap-2"}>
                        <div className={"px-2 py-1 dash-block-3 rounded-[.3125rem] flex"}>
                          <Text size={12} weight="medium" color="default" opacity={50}>
                            {data.names}:
                          </Text>
                        </div>
                        <div className={"px-2 py-1 dash-block-3 rounded-[.3125rem] flex"}>
                          <Text size={12} weight={"medium"} color={"default"}>
                            {entry.name.split('.')[0]}
                            <span className={"text-dash-brand"}>.{entry.name.split('.')[1]}</span>
                          </Text>
                        </div>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className={"p-4 text-center"}>
                  <Text size={14} weight={"normal"} color={"default"} opacity={50}>
                    {data.noResults}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
