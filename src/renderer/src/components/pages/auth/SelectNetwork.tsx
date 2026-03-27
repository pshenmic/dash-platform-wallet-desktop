import { NetworkOption } from '@renderer/components/ui/NetworkOption';
import { Button } from '@renderer/components/dash-ui-kit-enxtended';
import { SelectNetworkTexts } from '@renderer/constants';
import { NetworkValue } from '@renderer/hooks/useCreateWallet';

export default function  SelectNetwork({ data, network, setNetwork, goToWelcome } : { data: SelectNetworkTexts, network: NetworkValue, setNetwork: (network: NetworkValue) => void, goToWelcome: () => void }): React.JSX.Element {
  const OPTIONS: { value: NetworkValue; label: string }[] = [
    { value: "mainnet", label: data.mainnet },
    { value: "testnet", label: data.testnet },
  ]

  return (
    <div className={"flex flex-col w-full gap-6"}>
      <div role={"radiogroup"} className={"flex gap-[.625rem]"}>
        {OPTIONS.map((opt) => (
          <NetworkOption
            key={opt.value}
            value={opt.value}
            label={opt.label}
            selected={network === opt.value}
            onSelect={setNetwork}
          />
        ))}
      </div>
      <Button
          variant={"solid"}
          colorScheme={"primary"}
          size={"md"}
          onClick={() => goToWelcome()}
          className={"p-4.5"}
        >
          {data.buttonNext}
        </Button>
    </div>
  )
}
