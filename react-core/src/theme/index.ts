import { PaletteType } from '@material-ui/core'

export type ThemePreferenceType = PaletteType | 'device'

export function isDarkModePreferred(): boolean {
	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

