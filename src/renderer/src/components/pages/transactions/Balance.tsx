import { useState } from 'react';
import { Identifier, Avatar, Select } from 'dash-ui-kit/react';
import { PencilIcon, EyeOpenIcon, EyeClosedIcon } from '@renderer/components/dash-ui-kit-enxtended/icons';
import { Text } from '@renderer/components/dash-ui-kit-enxtended';
import { transactionsPage } from '@renderer/constants';
import BalanceInfo from '@renderer/components/ui/BalanceInfo';

export default function Balance(): React.JSX.Element {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { balance: { balance, usdPrice, comparedToYesterday } } = transactionsPage

  const comparedToYesterdayWords = comparedToYesterday.trim().split(' ')
  const lastWord = comparedToYesterdayWords.pop() ?? ''
  const firstPart = comparedToYesterdayWords.join(' ')

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
            className={"dash-text-default !text-[.875rem] !font-medium"}
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
          <div className={"w-px h-5 bg-dash-primary-dark-blue/25 dark:bg-white/25"} />
          <button
            className={"flex items-center gap-[.3125rem] cursor-pointer"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Text size={14} weight={"medium"} color={"brand"} opacity={50}>
              Main_account
            </Text>
            <PencilIcon size={12} className={"opacity-50 dash-text-default"} />
          </button>
        </div>
        <div className={"flex flex-col"}>
          <div className={"flex items-center gap-2"}>
            <Text size={36} weight={"normal"} color={"brand"} className={"leading-[100%] tracking-[-0.03em]"}>
              {balance}:
            </Text>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className={`
                size-6
                dash-block
                rounded-[.25rem]
                p-[.25rem]
                flex
                items-center
                justify-center
                cursor-pointer
              `}
            >
              {isBalanceVisible ? (
                <EyeOpenIcon size={16} className={"dash-text-default"} />
              ) : (
                <EyeClosedIcon size={16} className={"dash-text-default"} />
              )}
            </button>
          </div>
          <Text size={36} weight={"extrabold"} color={"blue"} className={"leading-[100%] tracking-[-0.03em] my-[.625rem]"}>
          {isBalanceVisible  ? '32 000 000 000 000' : '••••••••••••••'}
          </Text>
          <BalanceInfo isBalanceVisible={isBalanceVisible} />
        </div>
      </div>

      <div className={"p-6 rounded-3xl shadow-[0_0_32px_0_rgba(12,28,51,0.08)] dash-card-base"}>
        <Text size={16} weight={"medium"} color={"brand"} className={"mb-2"}>
         {usdPrice}
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
          <div className={"flex items-center justify-center py-1 px-2 rounded-3xl dash-block-accent-12"}>
            <Text size={12} weight={"extrabold"} color={"blue-mint"}>
            ↑3.6%
            </Text>
          </div>
        </div>
        <Text size={14} weight={"normal"} color={"brand"} opacity={30} className={"leading-[114%]"}>
          {firstPart} <span className={"font-extrabold"}>{lastWord}</span>
        </Text>
      </div>
    </div>
  )
}
