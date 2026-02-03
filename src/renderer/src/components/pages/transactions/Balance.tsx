import { useState } from 'react';
import { Identifier, Avatar, Select } from 'dash-ui-kit/react';
import { PencilIcon, EyeOpenIcon, EyeClosedIcon } from '@renderer/components/dash-ui-kit-enxtended/icons';
import { Text } from '@renderer/components/dash-ui-kit-enxtended';

export default function Balance(): React.JSX.Element {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const accountOptions = [
    {
      value: 'account',
      label: '',
      content: (
        <div className={"flex items-center gap-[.3125rem]"}>
          <Avatar
            username={"account"}
            width={20}
            height={20}
            className={"size-5 shrink-0"}
          />
          <Identifier
            username={"account"}
            middleEllipsis={true}
            edgeChars={4}
            className={"text-dash-primary-dark-blue dark:text-white !text-[.875rem] !font-medium"}
          >
            6Eb4a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p24c
          </Identifier>
        </div>
      )
    }
  ]

  return (
    <div className={"flex items-end gap-5 justify-between w-full"}>
      <div className={"flex flex-col gap-5"}>
        <div className={"flex items-center gap-[.9375rem] w-fit"}>
          <Select
            options={accountOptions}
            value={"account"}
            disabled={true}
            showArrow={true}
            size={null}
            border={false}
            className={"flex-1 !bg-transparent h-fit"}
          />
          <div className={"w-px h-5 bg-dash-primary-dark-blue/[0.25] dark:bg-white/[0.25]"} />
          <button
            className={"flex items-center gap-[.3125rem] cursor-pointer"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Text size={14} weight={"medium"} color={"brand"} opacity={50}>
              Main_account
            </Text>
            <PencilIcon size={12} className={"opacity-50 text-dash-primary-dark-blue dark:text-white"} />
          </button>
        </div>
        <div className={"flex flex-col"}>
          <div className={"flex items-center gap-2"}>
            <Text size={36} weight={"normal"} color={"brand"} className={"leading-[100%] tracking-[-0.03em]"}>
              Balance:
            </Text>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className={`
                size-6
                bg-dash-primary-dark-blue/5
                dark:bg-white/4
                rounded-[.25rem]
                p-[.25rem]
                flex
                items-center
                justify-center
                transition-colors
                cursor-pointer
              `}
            >
              {isBalanceVisible ? (
                <EyeOpenIcon size={16} className={"text-dash-primary-dark-blue dark:text-white"} />
              ) : (
                <EyeClosedIcon size={16} className={"text-dash-primary-dark-blue dark:text-white"} />
              )}
            </button>
          </div>
          <Text size={36} weight={"extrabold"} color={"only-brand"} className={"leading-[100%] tracking-[-0.03em]"}>
          {isBalanceVisible  ? '32 000 000 000 000' : '••••••••••••••'}
          </Text>
          <div
            className={`
              flex
              items-center
              gap-[.625rem]
              flex-wrap
              mt-[.625rem]
              rounded-[.3125rem]
              bg-dash-brand/10
              dark:bg-dash-mint/10
              p-[.3125rem]
              w-fit
            `}
          >
            <Text size={14} weight={"normal"} color={"blue"}>
              ~ {isBalanceVisible ? '6222.00' : '•••••••••'} USD
            </Text>
            <div className={"w-px h-4 bg-dash-brand/25 dark:bg-dash-mint/25"} />
            <Text size={14} weight={"normal"} color={"blue"}>
              {isBalanceVisible ? '320' : '•••••••••'}Dash
            </Text>
          </div>
        </div>
      </div>

      <div className={"p-6 rounded-3xl shadow-[0_0_32px_0_rgba(12,28,51,0.08)] bg-white dark:bg-white/4 dark:border dark:border-white/12"}>
        <Text size={16} weight={"medium"} color={"brand"} className={"mb-2"}>
        USD price
        </Text>
        <div className={"flex items-center gap-4 mb-2"}>
          <div className={"flex items-end"}>
            <Text size={32} weight={"extrabold"} color={"brand"} className={"leading-[100%]"}>
              $38
            </Text>
            <Text size={16} weight={"normal"} color={"brand"} className={"leading-[100%]"}>
              .550
            </Text>
          </div>
          <div className={"flex items-center justify-center py-1 px-2 rounded-3xl bg-dash-brand/12 dark:bg-dash-mint/12"}>
            <Text size={12} weight={"extrabold"} color={"blue"}>
            ↑3.6%
            </Text>
          </div>
        </div>
        <Text size={14} weight={"normal"} color={"brand"} opacity={35} className={"leading-[114%]"}>
        Compared to <span className={"font-extrabold"}>yesterday</span>
        </Text>
      </div>
    </div>
  )
}
