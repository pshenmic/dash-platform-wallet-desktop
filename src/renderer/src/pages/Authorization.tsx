import { useState } from 'react';
import { DashLogo, useTheme } from 'dash-ui-kit/react';
import { Text, Button, Input, WalletIcon } from '@renderer/components/dash-ui-kit-enxtended';
import { Link } from 'react-router-dom';
import { authorizationTexts } from '@renderer/constants';
import bgLight from '@renderer/assets/images/pageAuthorization/bg-light.svg';
import bgDark from '@renderer/assets/images/pageAuthorization/bg-dark.svg';
import wave from '@renderer/assets/images/pageAuthorization/wave.png';

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps): React.JSX.Element {
  const { title, description, form, links } = authorizationTexts
  const [password, setPassword] = useState('')
  const { theme } = useTheme()
  const backgroundImage = theme === 'dark' ? bgDark : bgLight
  const colorIcon = theme === 'dark' ? '#ffffff' : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className={"h-screen flex items-end overflow-hidden p-12"}>
      <img
        src={backgroundImage}
        alt={"background gradient"}
        className={"absolute inset-0 w-full h-full object-cover pointer-events-none"}
      />
      <img
        src={wave}
        alt={"wave"}
        className={"absolute bottom-0 left-0 w-full h-full object-cover pointer-events-none"}
      />
      <div className={"flex flex-col w-full"}>
        <DashLogo  containerSize={50}/>
        <Text as={"h1"} className={"mt-6 leading-[78%] tracking-[-0.03em]"} color={"brand"} size={64} weight={"extrabold"}>{title}</Text>
        <Text as={"p"} className={"mt-6"} color={"brand"}size={18} weight={"medium"} opacity={50}>{description}</Text>
        <form onSubmit={handleSubmit} className={"grid grid-cols-2 gap-3.75 mt-8 w-full"}>
          <div className={"flex flex-col gap-[.625rem]"}>
            <label htmlFor={"password-input"}>
              <Text as={"label"} size={16} weight={"medium"} color={"brand"}>
                {form.passwordLabel}
              </Text>
            </label>
            <Input
              id={"password-input"}
              type={"password"}
              placeholder={form.passwordPlaceholder}
              value={password}
              variant={"border"}
              onChange={(e) => setPassword(e.target.value)}
              className={'h-full rounded-[1.25rem]'}
              colorIcon={colorIcon}
            />
          </div>
          <Button
            type={"submit"}
            colorScheme={"primary"}
            size={"xl"}
            className={"h-fit rounded-[1.25rem] self-end relative overflow-hidden"}
            disabled={!password}
          >
            {form.submitButton}
          </Button>
        </form>
        <div className={"flex items-center justify-center gap-[.9375rem] mt-6.25"}>
          <Link
            to={links.register.to}
            className={"flex items-center gap-2 group"}
            aria-label={`${links.register.label} link`}
          >
            <WalletIcon
              size={16}
              className={`
              dash-text-default
              opacity-35
              group-hover:opacity-100
            group-hover:text-dash-brand
            dark:group-hover:text-dash-mint
              transition-[opacity,color]
              `}
            />
            <Text
              size={16}
              color={"brand"}
              opacity={35}
              className={`
                group-hover:opacity-100
              group-hover:text-dash-brand
              dark:group-hover:text-dash-mint
                transition-[opacity,color]
              `}>
              {links.register.label}
            </Text>
          </Link>
          <span className={"h-4 w-px dash-block-solid opacity-35"} />
          <Link
            to={links.forgotPassword.to}
            className={"group"}
            aria-label={`${links.forgotPassword.label} link`}
          >
            <Text
            size={16}
            color={"brand"}
            opacity={35}
            className={`
              group-hover:opacity-100
            group-hover:text-dash-brand
            dark:group-hover:text-dash-mint
              transition-[opacity,color]
            `}>
              {links.forgotPassword.label}
            </Text>
          </Link>
        </div>
      </div>
    </div>
  )
}
