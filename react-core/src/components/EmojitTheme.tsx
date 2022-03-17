import blue from '@mui/material/colors/blue'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeOptions, ThemeProvider } from '@mui/material/styles'
import React from 'react'
import { isDarkModePreferred, ThemePreferenceType } from '../theme'

export const DARK_MODE_INPUT_BACKGROUND_COLOR = '#303030'
export const DARK_MODE_INPUT_COLOR = '#eee'

type Props = {
	children: JSX.Element | JSX.Element[]
	themePreference?: ThemePreferenceType
}

// Defaulting to light theme makes the page not flash black in light mode.
// In dark mode, the page will always start white.
// A person's device preference is likely to be the same as their preference here, so defaulting to a device should mininize a possible quick flash (like most pages have anyway).

export class EmojitTheme extends React.Component<Props> {
	mapThemePreference(themePreference?: ThemePreferenceType): 'dark' | 'light' {
		if (themePreference === undefined || themePreference === 'device') {
			return isDarkModePreferred() ? 'dark' : 'light'
		}
		return themePreference
	}

	render(): React.ReactNode {
		const themePreference = this.mapThemePreference(this.props.themePreference)

		const themeOptions: ThemeOptions = {
			palette: {
				mode: themePreference,
			}
		}

		if (themePreference === 'dark') {
			// Easier to see in dark mode.
			if (!themeOptions.palette) {
				themeOptions.palette = {}
			}
			themeOptions.palette.primary = {
				main: blue[300],
			}
		}
		const theme = createTheme(themeOptions)
		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{this.props.children}
			</ThemeProvider>
		)
	}
}