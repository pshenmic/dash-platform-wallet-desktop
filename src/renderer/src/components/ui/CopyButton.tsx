import { CopyIcon2 } from '@renderer/components/dash-ui-kit-enxtended/icons'

type CopyButtonProps = {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps): React.JSX.Element {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className={`size-5 rounded-[.3125rem] flex items-center justify-center dash-block-5 hover:opacity-80 transition-opacity duration-200 cursor-pointer ${className}`}
    >
      <CopyIcon2 color={'currentColor'} className={'dash-text-default opacity-50'} />
    </button>
  )
}
