import { useEffect } from "react"
import { useTheme } from '@/context/theme-provider.tsx'

function getThemeBackgroundColor(): string {
  const el = document.createElement("div")
  el.style.backgroundColor = "var(--background)"
  document.body.appendChild(el)

  const color = getComputedStyle(el).backgroundColor
  document.body.removeChild(el)

  return color // rgb(r g b / 1)
}

function syncThemeColor() {
  const meta = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement | null

  if (!meta) return

  meta.setAttribute("content", getThemeBackgroundColor())
}

export function useSyncStatusBar() {
  const { theme  } = useTheme()
  useEffect(() => {
    syncThemeColor()
  }, [theme])
}
