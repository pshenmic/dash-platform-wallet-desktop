import { BigNumber } from 'dash-ui-kit/react'
import { Text } from '@renderer/components/dash-ui-kit-enxtended'
import { ReceiveIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
// import { addressesPage } from '@renderer/constants'
import CustomBadge from '@renderer/components/ui/CustomBadge'
import CopyButton from '@renderer/components/ui/CopyButton'
import QrButton from '@renderer/components/ui/QrButton'
import { WalletAddressDto } from '@renderer/hooks/useAdresses'

export default function AddressCard({
  // walletId,
  // accountId,
  address,
  balance,
  usdBalance,
}: WalletAddressDto): React.JSX.Element {
  return (
    <div className={"flex items-center justify-between px-[.9375rem] py-[.625rem] rounded-[.875rem] dash-block"}>
      <div className={"flex flex-col gap-1"}>
        <div className={"flex items-center gap-[.3125rem]"}>
          <div className={"size-[.875rem] rounded-full dash-block-5 flex items-center justify-center"}>
            <ReceiveIcon size={6} color={"currentColor"} className={"dash-text-default"} />
          </div>
          <Text size={12} weight={"medium"} color={"brand"}>
            {address}
          </Text>
          <CopyButton text={address} />
          <QrButton />
        </div>
        {/* <Text size={10} weight={"medium"} color={"brand"} opacity={50}>
          {addressesPage.labelPrefix}: {label}
        </Text> */}
      </div>

      <div className={"flex flex-col items-end gap-1"}>
        <div className={"flex items-center gap-2"}>
          <Text size={14} weight={"medium"} color={"brand"}>
            <span className={"font-bold"}>
              <BigNumber>{balance}</BigNumber>
            </span>
            {' Dash'}
          </Text>
          <CustomBadge text={`~ $${usdBalance}`} variant="default" size="xs" />
        </div>
        {/* <Text size={10} weight={"medium"} color={"brand"} opacity={50}>
          KeyStore: <span className={"font-extrabold"}>{keyStore}</span>
        </Text> */}
      </div>
    </div>
  )
}
