import SeedPhraseWarning from "./SeedPhraseWarning"
import { useState } from 'react'
import { Button, Text } from "@renderer/components/dash-ui-kit-enxtended"
import { Switch } from "dash-ui-kit/react"
import { BaseTexts, ImportSeedPhraseTexts } from "@renderer/constants"
import { TypeUseCreateWallet, WordCount } from "@renderer/hooks/useCreateWallet"

type ImportSeedPhraseData = Pick<ImportSeedPhraseTexts, 'buttonContinue'> & {
  seedPhraseWarning: BaseTexts
}

type ImportSeedPhraseProps = Pick<TypeUseCreateWallet, 'submitImportSeedPhrase'> & {
  data: ImportSeedPhraseData
}

export default function ImportSeedPhrase({ submitImportSeedPhrase, data }: ImportSeedPhraseProps): React.JSX.Element {
  const [wordCount, setWordCount] = useState<WordCount>(12)
  const [words, setWords] = useState<string[]>(Array(12).fill(''))

  const options = [
    { label: "12 words", value: 12 as const },
    { label: "24 words", value: 24 as const },
  ]

  const handleWordCountChange = (count: WordCount) => {
    setWordCount(count)
    setWords(Array(count).fill(''))
  }

  const handleWordChange = (index: number, value: string) => {
    const updated = [...words]
    updated[index] = value.trim().toLowerCase()
    setWords(updated)
  }

  const handleContinue = () => {
    submitImportSeedPhrase(words)
  }

  const isValid = words.length === wordCount && words.every(w => w.trim().length > 0)

  return (
    <div className={"flex flex-col w-full gap-6"}>
      <Switch
        options={options}
        value={wordCount}
        onChange={handleWordCountChange}
      />

      <div className={"grid grid-cols-6 gap-3 w-full"}>
        {Array.from({ length: wordCount }).map((_, index) => (
          <div
            key={index}
            className={"flex items-center gap-[.625rem] px-[.9375rem] rounded-[.9375rem] border border-dash-primary-dark-blue/35 dark:border-white/35"}
          >
            <Text size={14} weight={"medium"} color={"default"} opacity={30} className={"leading-[164%] shrink-0"}>
              {index + 1}.
            </Text>
            <input
              type={"text"}
              value={words[index] ?? ''}
              onChange={(e) => handleWordChange(index, e.target.value)}
              autoComplete={"off"}
              autoCorrect={"off"}
              spellCheck={false}
              className={`
                w-full bg-transparent outline-none
                text-[.875rem] font-medium
                text-dash-primary-dark-blue dark:text-white
                placeholder:text-dash-primary-dark-blue/30 dark:placeholder:text-white/30
                py-[.625rem]
              `}
            />
          </div>
        ))}
      </div>

      <SeedPhraseWarning {...data.seedPhraseWarning} />

      <Button
        colorScheme={"primary"}
        size={"md"}
        className={"rounded-[.9375rem] p-4.5"}
        disabled={!isValid}
        onClick={handleContinue}
      >
        {data.buttonContinue}
      </Button>
    </div>
  )
}
