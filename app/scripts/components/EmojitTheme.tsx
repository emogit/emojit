import { PaletteType, ThemeProvider } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import React from 'react'
import { setupUserSettings, ThemePreferenceType } from '../user'

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
	themePreference: ThemePreferenceType,
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			// Defaulting to light makes the page not flash black in light mode.
			// In dark mode, the page will always start white.
			// A person's device preference is likely to be the same as their preference here, so defaulting to a device should mininize a possible quick flash (like most pages have anyway).
			themePreference: 'device',
		}
	}

	async componentDidMount(): Promise<void> {
		const { themePreference } = await setupUserSettings(['themePreference'])
		if (themePreference !== this.state.themePreference) {
			this.setState({
				themePreference,
			})
		}
	}

	render(): React.ReactNode {
		return (
			<WithClasses themePreference={this.state.themePreference}>
				{this.props.children}
			</WithClasses>
		)
	}
}