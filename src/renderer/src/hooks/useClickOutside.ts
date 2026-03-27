import { RefObject, useEffect } from 'react'

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void
): void {
  useEffect(() => {
    const handler = (event: MouseEvent): void => {
      const node = ref.current
      if (!node) return
      if (!node.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handler as EventListener)
    return () => {
      document.removeEventListener('mousedown', handler as EventListener)
    }
  }, [ref, onOutsideClick])
}