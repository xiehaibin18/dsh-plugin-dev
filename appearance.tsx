/** @jsxRuntime classic */
import * as React from 'react'

export type PreviewLanguage = 'zh' | 'en'
export type PreviewTheme = 'light' | 'dark'

interface AppearanceProps {
  language: PreviewLanguage
  theme: PreviewTheme
  onLanguageChange: (language: PreviewLanguage) => void
  onThemeChange: (theme: PreviewTheme) => void
}

export function PreviewAppearanceControls({ language, theme, onLanguageChange, onThemeChange }: AppearanceProps) {
  return (
    <>
      <label>
        界面语言
        <select value={language} onChange={(event) => onLanguageChange(event.target.value as PreviewLanguage)}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
      <label>
        主题
        <select value={theme} onChange={(event) => onThemeChange(event.target.value as PreviewTheme)}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </label>
    </>
  )
}
