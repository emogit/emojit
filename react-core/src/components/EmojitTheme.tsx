import { PaletteType, ThemeOptions, ThemeProvider } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
// FIXME Get setupUserSettings.
import { setupUserSettings } from 'FIXME'
import React from 'react'
import browser from 'webextension-polyfill'
import { isDarkModePreferred, ThemePreferenceType } from '../theme'

export const DARK_MODE_INPUT_BACKGROUND_COLOR = '#303030'
export const DARK_MODE_INPUT_COLOR = '#eee'

type Props = {
	children: JSX.Element | JSX.Element[],
	// TODO Add themePreference so that an extra lookup can be avoided.
}

export class EmojitTheme extends React.Component<Props, {
	themePreference: PaletteType,
}> {
	constructor(props: Props) {
		super(props)
		this.state = {
			// Defaulting to light makes the page not flash black in light mode.
			// In dark mode, the page will always start white.
			// A person's device preference is likely to be the same as their preference here, so defaulting to a device should mininize a possible quick flash (like most pages have anyway).
			themePreference: this.mapThemePreference(),
		}
	}

	mapThemePreference(themePreference?: ThemePreferenceType): 'dark' | 'light' {
		if (themePreference === undefined || themePreference === 'device') {
			return isDarkModePreferred() ? 'dark' : 'light'
		}
		return themePreference
	}

	async componentDidMount(): Promise<void> {
		let { themePreference } = await setupUserSettings(['themePreference'])
		themePreference = this.mapThemePreference(themePreference)
		if (themePreference !== this.state.themePreference) {
			this.setState({
				themePreference,
			})
		}

		// FIXME Abstract away browser.
		browser.storage.onChanged.addListener((changes, areaName) => {
			if (areaName === 'local' && changes.themePreference) {
				const themePreference = this.mapThemePreference(changes.themePreference.newValue)
				if (themePreference !== this.state.themePreference) {
					this.setState({
						themePreference,
					})
				}
			}
		})
	}

	render(): React.ReactNode {
		const { themePreference } = this.state

		const themeOptions: ThemeOptions = {
			palette: {
				type: themePreference,
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

			const backgroundColor = DARK_MODE_INPUT_BACKGROUND_COLOR
			const color = DARK_MODE_INPUT_COLOR
			themeOptions.props = {}
			themeOptions.props.MuiTextField = {
				inputProps: {
					style: { backgroundColor, color, },
				},
			}
		}
		const theme = createMuiTheme(themeOptions)
		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{this.props.children}
			</ThemeProvider>
		)
	}
}