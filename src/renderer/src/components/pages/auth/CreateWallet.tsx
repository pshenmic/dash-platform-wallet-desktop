import { useState } from 'react';
import { Button, Input, Text } from "@renderer/components/dash-ui-kit-enxtended";
import { useTheme } from 'dash-ui-kit/react';
import { TypeUseCreateWallet } from '@renderer/hooks/useCreateWallet';
import { CreateWalletTexts } from '@renderer/constants';

type CreateWalletData = Pick<
  CreateWalletTexts,
  'labelConfirmPassword' |
  'placeholderConfirmPassword' |
  'buttonNext' |
  'labelPassword' |
  'placeholderPassword'
>;

type CreateWalletProps = Pick<TypeUseCreateWallet, 'password' | 'setPassword' | 'generateSeedPhrase'> & {
  data: CreateWalletData
};

export default function CreateWallet({ password, setPassword, generateSeedPhrase, data } : CreateWalletProps): React.JSX.Element {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#ffffff' : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    generateSeedPhrase();
  };

  return (
    <form onSubmit={handleSubmit} className={"flex flex-col w-full gap-3.75"}>
      <div className={"grid grid-cols-2 gap-3.75"}>
        <div className={"flex flex-col gap-[.625rem]"}>
          <label htmlFor={"password-input"}>
            <Text as={"label"} size={16} weight={"medium"} color={"brand"} opacity={50}>
              {data.labelPassword}
            </Text>
          </label>
          <Input
            id={"password-input"}
            type={"password"}
            placeholder={data.placeholderPassword}
            value={password}
            variant={"outlined"}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className={'h-full rounded-[1.25rem]'}
            iconColor={iconColor}
            colorScheme={error ? 'error' : 'primary'}
          />
        </div>
        <div className={"flex flex-col gap-[.625rem]"}>
          <label htmlFor={"confirm-password-input"}>
            <Text as={"label"} size={16} weight={"medium"} color={"brand"} opacity={50}>
              {data.labelConfirmPassword}
            </Text>
          </label>
          <Input
            id={"confirm-password-input"}
            type={"password"}
            placeholder={data.placeholderConfirmPassword}
            value={confirmPassword}
            variant={"outlined"}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            className={'h-full rounded-[1.25rem]'}
            iconColor={iconColor}
            colorScheme={error ? 'error' : 'primary'}
          />
        </div>
      </div>
      <Button
        type={"submit"}
        colorScheme={"primary"}
        size={"md"}
        className={"h-fit rounded-[1.25rem] self-end relative overflow-hidden w-full"}
        disabled={!password || !confirmPassword}
      >
        {data.buttonNext}
      </Button>
    </form>
  )
}
