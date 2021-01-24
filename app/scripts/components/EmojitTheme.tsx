import { ThemeProvider } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import React from 'react'

export function isDarkModePreferred(): boolean {
	return useMediaQuery('(prefers-color-scheme: dark)')
}

type Props = {
	children: JSX.Element | JSX.Element[],
}

export const EmojitTheme = ({ children }: Props) => {
	const prefersDarkMode = isDarkModePreferred()

	const theme = React.useMemo(
		() => {
			let primary = undefined
			if (prefersDarkMode) {
				// Easier to see in dark mode.
				primary = {
					main: blue[300],
				}
			}
			return createMuiTheme({
				palette: {
					type: prefersDarkMode ? 'dark' : 'light',
					primary,
				},
			})
		},
		[prefersDarkMode],
	)

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	)
}