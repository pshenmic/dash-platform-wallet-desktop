export function renderBoldText(text: string): React.ReactNode[] {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className={"font-extrabold"}>{part.slice(2, -2)}</span>
      }
      return <span key={i}>{part}</span>
    })
}