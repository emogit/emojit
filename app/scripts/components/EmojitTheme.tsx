import { PaletteType, ThemeProvider } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import React from 'react'
import { setupUserSettings } from '../user'

export function isDarkModePreferred(): boolean {
	return useMediaQuery('(prefers-color-scheme: dark)')
}

type Props = {
	children: JSX.Element | JSX.Element[],
	themePreference: PaletteType | 'device'
}


const WithClasses = (props: Props) => {
	const { children } = props
	let { themePreference } = props

	if (themePreference === 'device') {
		themePreference = isDarkModePreferred() ? 'dark' : 'light'
	}
	let primary = undefined
	if (themePreference === 'dark') {
		// Easier to see in dark mode.
		primary = {
			main: blue[300],
		}
	}
	const theme = createMuiTheme({
		palette: {
			type: themePreference,
			primary,
		},
	})

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	)
}

export class EmojitTheme extends React.Component<{
	children: JSX.Element | JSX.Element[],
}, {
	themePreference: PaletteType | 'device',
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			// Default to light so that the page doesn't flash black.
			themePreference: 'light',
		}
	}

	async componentDidMount() {
		const { themePreference } = await setupUserSettings()
		this.setState({
			themePreference,
		})
	}

	render(): React.ReactNode {
		return (
			<WithClasses themePreference={this.state.themePreference}>
				{this.props.children}
			</WithClasses>
		)
	}
}