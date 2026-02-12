import { useRef, useCallback } from 'react'
import { useTheme } from 'dash-ui-kit/react'

type RippleVariant = 'primary' | 'light'

interface RippleOptions {
  variant?: RippleVariant
  opacity?: number
  zIndex?: number
}

const VARIANTS = {
  primary: { light: 'var(--color-dash-brand)', dark: 'var(--color-dash-brand)' },
  light: { light: 'white', dark: 'var(--color-background)' },
}

export function useRipple(options: RippleVariant | RippleOptions = 'primary') {
  const rippleRef = useRef<HTMLSpanElement | null>(null)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const currentSizeRef = useRef<number>(0)
  const { theme } = useTheme()

  const config = typeof options === 'string'
    ? { variant: options, opacity: 0.15, zIndex: 0 }
    : {
        variant: options.variant || 'primary',
        opacity: options.opacity ?? 0.15,
        zIndex: options.zIndex ?? 0
      }

  const background = theme === 'dark'
    ? VARIANTS[config.variant].dark
    : VARIANTS[config.variant].light

  const ensureRippleElement = useCallback((container: HTMLElement) => {
    if (!rippleRef.current) {
      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: ${background};
        pointer-events: none;
        z-index: ${config.zIndex};
        opacity: 0;
        transform: scale(0);
      `
      container.appendChild(ripple)
      rippleRef.current = ripple
    }
    return rippleRef.current
  }, [background, config.zIndex])

  const hide = useCallback(() => {
    const ripple = rippleRef.current
    if (!ripple) return

    if (lastPositionRef.current) {
      const size = currentSizeRef.current
      ripple.style.transition = 'none'
      ripple.style.left = `${lastPositionRef.current.x - size / 2}px`
      ripple.style.top = `${lastPositionRef.current.y - size / 2}px`

      requestAnimationFrame(() => {
        ripple.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out'
        ripple.style.opacity = '0'
        ripple.style.transform = 'scale(0)'
      })
    } else {
      ripple.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out'
      ripple.style.opacity = '0'
      ripple.style.transform = 'scale(0)'
    }
  }, [])

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const element = e.currentTarget

    const rect = element.getBoundingClientRect()
    const size = Math.sqrt(rect.width ** 2 + rect.height ** 2) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    currentSizeRef.current = size
    lastPositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    const ripple = ensureRippleElement(element)

    ripple.style.background = background
    ripple.style.transition = 'none'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.transform = 'scale(0)'
    ripple.style.opacity = '0'

    requestAnimationFrame(() => {
      ripple.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out'
      ripple.style.transform = 'scale(1)'
      ripple.style.opacity = String(config.opacity)
    })
  }, [background, ensureRippleElement, config.opacity])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const element = e.currentTarget
    const rect = element.getBoundingClientRect()
    lastPositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    hide()
  }, [hide])

  const show = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const size = Math.sqrt(rect.width ** 2 + rect.height ** 2) * 2
    const x = rect.width / 2 - size / 2
    const y = rect.height / 2 - size / 2

    currentSizeRef.current = size
    lastPositionRef.current = null

    const ripple = ensureRippleElement(element)

    ripple.style.background = background
    ripple.style.transition = 'none'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.transform = 'scale(0)'
    ripple.style.opacity = '0'

    requestAnimationFrame(() => {
      ripple.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out'
      ripple.style.transform = 'scale(1)'
      ripple.style.opacity = String(config.opacity)
    })
  }, [background, ensureRippleElement, config.opacity])

  return {
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    show,
    hide,
  }
}
