import { Text, WalletIcon } from "@renderer/components/dash-ui-kit-enxtended";
import { ChevronIcon, DashLogo, useTheme } from "dash-ui-kit/react";
import { ProgressStepBar } from "@renderer/components/dash-ui-kit-enxtended/progressStepBar";
import { authTexts } from "@renderer/constants";
import { useCreateWallet } from "@renderer/hooks/useCreateWallet";
import waveAuth from '@renderer/assets/images/pageAuthorization/waveAuth.png';
import bgLight from '@renderer/assets/images/pageAuthorization/Frame 717779 (1).png';
import bgDark from '@renderer/assets/images/pageAuthorization/Frame 717781 (1).png';
import CreateWallet from "../../components/pages/auth/CreateWallet";
import SeedPhrase from "../../components/pages/auth/SeedPhrase";
import VerifySeedPhrase from "../../components/pages/auth/VerifySeedPhrase";
import Success from "../../components/pages/auth/Success";

export default function CreateWalletWrapper(): React.JSX.Element {
  const {createWallet, saveYourSeedPhrase, fillInYourSeedPhrase, seedPhraseWarning, success} = authTexts
  const { theme } = useTheme()
  const backgroundImage = theme === 'dark' ? bgDark : bgLight

  const {
    step,
    generateSeedPhrase,
    setPassword,
    password,
    seedPhrase,
    wordCount,
    setWordCount,
    verifySeedPhrase,
    verifyPhrase,
    verifyMissingWords,
    goBack
  } = useCreateWallet()

  const title = step === 'password' ? createWallet.title : step === 'seed-phrase' ? saveYourSeedPhrase.title : step === 'verify' ? fillInYourSeedPhrase.title : ''
  const description = step === 'password' ? createWallet.description : step === 'seed-phrase' ? saveYourSeedPhrase.description : step === 'verify' ? fillInYourSeedPhrase.description : ''

  if (step === 'success') return <Success data={success} />

  return (
    <div className={"relative flex min-h-screen items-end"}>
      <img
        src={backgroundImage}
        alt={"background gradient"}
        className={"dash-bg-image-auth"}
      />
      <img
        src={waveAuth}
        alt={"wave"}
        className={"dash-bg-image-auth"}
      />

      {step !== 'password' &&
        <button
          className={`
            z-50
            absolute
            top-12
            left-12
            overflow-hidden
            size-12
            flex
            items-center
            justify-center
            rounded-[.9375rem]
            cursor-pointer
            bg-white/12
            backdrop-blur-[.5rem]
            transition-all duration-200 ease-in-out
            hover:bg-white/20
          `}
          onClick={goBack}
        >
          <ChevronIcon
            size={17}
            className={`
            text-white
            rotate-90
          `}/>
        </button>
      }

      <div className={"relative flex flex-col w-full h-full items-center justify-end p-12 pt-[25vh] "}>
        <div className={"flex flex-col w-full mb-8"}>
          <DashLogo  containerSize={50}/>
          <Text as={"h1"} className={"mt-6 leading-[78%] tracking-[-0.03em]"} color={"brand"} size={64} weight={"extrabold"}>{title}</Text>
          <Text as={"p"} className={"mt-6"} color={"brand"}size={18} weight={"medium"} opacity={50}>{description}</Text>
        </div>

        {step === 'password' &&
          <CreateWallet
            setPassword={setPassword}
            password={password}
            generateSeedPhrase={generateSeedPhrase}
            data={{
              labelConfirmPassword: createWallet.labelConfirmPassword,
              placeholderConfirmPassword: createWallet.placeholderConfirmPassword,
              buttonNext: createWallet.buttonNext,
              labelPassword: createWallet.labelPassword,
              placeholderPassword: createWallet.placeholderPassword
            }}
        />}
        {step === 'seed-phrase' &&
          <SeedPhrase
            data={{
              buttonContinue: saveYourSeedPhrase.buttonContinue,
              buttonCopy: saveYourSeedPhrase.buttonCopy,
              seedPhraseWarning: seedPhraseWarning
            }}
            seedPhrase={seedPhrase}
            verifySeedPhrase={verifySeedPhrase}
            wordCount={wordCount}
            setWordCount={setWordCount}
        />}
        {step === 'verify' &&
          <VerifySeedPhrase
            verifyPhrase={verifyPhrase}
            verifyMissingWords={verifyMissingWords}
            data={{
              buttonContinue: fillInYourSeedPhrase.buttonContinue,
              seedPhraseWarning: seedPhraseWarning
            }}
        />}

        <ProgressStepBar
          currentStep={step === 'password' ? 1 : step === 'seed-phrase' ? 2 : 3}
          totalSteps={3}
          className={"mt-[.75rem]"}
          color={"blue-mint"}
        />

        {step === 'password' &&
          <button className={"flex items-center gap-2 group cursor-pointer mt-6"}>
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
              opacity={30}
              className={`
                group-hover:opacity-100
              group-hover:text-dash-brand
              dark:group-hover:text-dash-mint
                transition-[opacity,color]
              `}>
              {createWallet.importWallet}
            </Text>
          </button>
        }
      </div>
    </div>
  )
}
