import { QrCodeIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'

type QrButtonProps = {
  onClick?: () => void
  className?: string
}

export default function QrButton({ onClick, className = '' }: QrButtonProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`size-5 rounded-[.3125rem] flex items-center justify-center dash-block-5 hover:opacity-80 transition-opacity duration-200 cursor-pointer ${className}`}
    >
      <QrCodeIcon color={'currentColor'} className={'dash-text-default opacity-50'} />
    </button>
  )
}
