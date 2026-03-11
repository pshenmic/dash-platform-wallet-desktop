import { useTheme } from 'dash-ui-kit/react';

export default function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={"fixed top-6 right-6 z-50"}>
      <button
        onClick={toggleTheme}
        className={"relative w-8 h-8 cursor-pointer rounded-full shadow-lg"}
      >
          {isDark ? '🌙' : '☀️'}
      </button>
    </div>
  )
}
