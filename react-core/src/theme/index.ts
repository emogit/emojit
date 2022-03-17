import { PaletteMode } from '@mui/material'

export type ThemePreferenceType = PaletteMode | 'device'

export function isDarkModePreferred(): boolean {
	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

