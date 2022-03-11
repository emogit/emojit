import { EmojitClient, PageReaction } from "@emogit/emojit-core"
import { ReactionsComponent, ThemePreferenceType } from "@emogit/emojit-react-core"
import { progressSpinnerColor } from '@emogit/react-core'
import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import HistoryIcon from '@material-ui/icons/History'
import React from 'react'
import browser from 'webextension-polyfill'
import { setupUserSettings } from '../user'


function openBadges(): void {
	browser.tabs.create({ url: '/pages/home.html?page=badges' })
}

function openHistory(): void {
	browser.tabs.create({ url: '/pages/home.html?page=history' })
}

function openOptions(): void {
	browser.runtime.openOptionsPage()
}

const styles = (theme: Theme) => createStyles({
	header: {
		marginBottom: theme.spacing(1),
	},
	reactingLoader: {
		position: 'relative',
		top: '-2px',
		paddingRight: '2px',
	},
	end: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
	},
	historyButton: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		border: 'none',
		outline: 'none',
		fontSize: '2em',
		// Make the buttons line up.
		position: 'relative',
		top: '9px',
	},
	badgesButton: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		border: 'none',
		outline: 'none',
		fontSize: '1.5em',
	},
	optionsButton: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		border: 'none',
		outline: 'none',
		// Make sure it align with the right side.
		paddingRight: theme.spacing(0.5),
		fontSize: '1.5em',
	},
})


class Reactions extends React.Component<WithStyles<typeof styles>, {
	emojit?: EmojitClient,
	pageUrl?: string,
	tab?: browser.Tabs.Tab,
	themePreference?: ThemePreferenceType,
	// TODO Maybe use redux for showReactingLoader so that it synced with other component that are loading?
	showReactingLoader: boolean,
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			showReactingLoader: false,
		}
	}

	updateBadgeText(pageReactions?: PageReaction[]): void {
		if (!pageReactions || pageReactions.length === 0) {
			return
		}
		const topReaction = pageReactions.reduce((prev, current) => prev.count < current.count ? current : prev)

		if (topReaction && topReaction.count > 0) {
			browser.browserAction.setBadgeText({ tabId: this.state.tab!.id, text: topReaction.reaction })
		} else {
			browser.browserAction.setBadgeText({ tabId: this.state.tab!.id, text: null })
		}
	}

	async componentDidMount() {
		const { emojit, themePreference } = await setupUserSettings(['emojit', 'themePreference'])
		this.setState({ emojit, themePreference })
		browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
			const pageUrl = tabs[0].url
			this.setState({ pageUrl, tab: tabs[0] })
		})
	}

	render(): React.ReactNode {
		const { classes } = this.props
		const { emojit, pageUrl, themePreference } = this.state

		if (emojit === undefined || themePreference === undefined || pageUrl === undefined) {
			return (<div>
				<CircularProgress size={60} style={{ color: progressSpinnerColor }} />
			</div>)
		} else {
			return (<div>
				<div className={`${classes.header} ${classes.end}`}>
					{this.state.showReactingLoader && <CircularProgress className={classes.reactingLoader} size={20} thickness={5} style={{ color: progressSpinnerColor }} />}
					<button className={classes.historyButton}
						onClick={openHistory}>
						<HistoryIcon color="primary" fontSize="inherit" />
					</button>
					<button className={classes.badgesButton}
						onClick={openBadges}>
						🏆
					</button>
					<button
						className={classes.optionsButton}
						onClick={openOptions}>
						⚙️
					</button>
				</div>

				<ReactionsComponent
					emojitClient={emojit}
					themePreference={themePreference}
					onPageReactions={this.updateBadgeText}
					pageUrl={pageUrl} />
			</div>)
		}
	}
}

export default withStyles(styles)(Reactions)
