import { useEffect } from 'react'
import { useTheme } from 'dash-ui-kit/react'

export function useSystemTheme() {
  const { setTheme } = useTheme()

  useEffect(() => {
    window.darkMode.system()

    window.darkMode.get().then(isDark => {
      setTheme(isDark ? 'dark' : 'light')
    })

    window.darkMode.onChange((isDark) => {
      setTheme(isDark ? 'dark' : 'light')
    })
  }, [setTheme])
}
