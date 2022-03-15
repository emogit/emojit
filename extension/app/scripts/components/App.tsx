import { EmojitTheme, ThemePreferenceType } from '@emogit/emojit-react-core'
import Container from '@material-ui/core/Container'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import HistoryIcon from '@material-ui/icons/History'
import React from 'react'
import browser from 'webextension-polyfill'
import { updateUrl } from '../url_helper'
import { setupUserSettings } from '../user'
import Badges from './Badges'
import History from './History'
import Options from './Options'

const styles = (theme: Theme) => createStyles({
	headerSection: {
		marginBottom: theme.spacing(1),
	},
	end: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
	},
	pageButton: {
		// Make it look like a button since I couldn't figure out how to remove the background color of a Button.
		cursor: 'pointer',
		textDecoration: 'none',
		padding: '4px',
		marginRight: theme.spacing(2),
		fontSize: '1.5em',
		opacity: 0.4,
	},
	historyButton: {
		// Make the buttons line up.
		position: 'relative',
		top: '5px',
	},
	selectedPageButton: {
		opacity: 1,
	},
})

class App extends React.Component<WithStyles<typeof styles>, {
	page: string
	themePreference?: ThemePreferenceType
}> {
	constructor(props: any) {
		super(props)
		const urlParams = new URLSearchParams(window.location.search)
		const page: string = urlParams.get('page') || 'options'
		this.state = {
			page,
		}

		this.showBadges = this.showBadges.bind(this)
		this.showOptions = this.showOptions.bind(this)
		this.showHistory = this.showHistory.bind(this)
	}

	async componentDidMount() {
		const { themePreference } = await setupUserSettings(['themePreference'])
		this.setState({ themePreference })

		browser.storage.onChanged.addListener((changes, areaName) => {
			if (areaName === 'local' && changes.themePreference) {
				const themePreference = changes.themePreference.newValue
				if (themePreference !== this.state.themePreference) {
					this.setState({
						themePreference,
					})
				}
			}
		})
	}

	showBadges() {
		const page = 'badges'
		this.setState({ page })
		updateUrl({ page })
	}

	showHistory() {
		const page = 'history'
		this.setState({ page })
		updateUrl({ page })
	}

	showOptions() {
		const page = 'options'
		this.setState({ page })
		updateUrl({ page })
	}

	render(): React.ReactNode {
		const { classes } = this.props
		const { themePreference } = this.state

		return <div>
			<EmojitTheme themePreference={themePreference}>
				<Container>
					<div className={`${classes.headerSection} ${classes.end}`}>
						<a className={`${classes.pageButton} ${classes.historyButton} ${this.state.page === 'history' ? classes.selectedPageButton : ''}`}
							onClick={this.showHistory}>
							<HistoryIcon color="primary" />
						</a>
						<a className={`${classes.pageButton} ${this.state.page === 'badges' ? classes.selectedPageButton : ''}`}
							onClick={this.showBadges}>
							🏆
						</a>
						<a className={`${classes.pageButton} ${this.state.page === 'options' ? classes.selectedPageButton : ''}`}
							onClick={this.showOptions}>
							⚙️
						</a>
					</div>
				</Container>
				{this.page()}
			</EmojitTheme>
		</div>
	}

	private page(): JSX.Element {
		switch (this.state.page) {
			case 'badges':
				return <Badges />
			case 'history':
				return <History />
			case 'options':
				return <Options />
		}
		// Shouldn't happen.
		return <div></div>
	}
}

export default withStyles(styles)(App)