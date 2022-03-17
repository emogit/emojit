import { EmojitClient, PageReaction } from '@emogit/emojit-core'
import { progressSpinnerColor, ReactionsComponent, ThemePreferenceType } from '@emogit/emojit-react-core'
import HistoryIcon from '@mui/icons-material/History'
import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'
import browser from 'webextension-polyfill'
import { BrowserGetMessage } from '../i18n_helper'
import classes from '../styles/Reactions.module.css'
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

// type Props = unknown

class Reactions extends React.Component<unknown, {
	emojit?: EmojitClient
	pageUrl?: string
	tab?: browser.Tabs.Tab
	themePreference?: ThemePreferenceType
	// TODO Maybe use redux for showReactingLoader so that it synced with other component that are loading?
	showReactingLoader: boolean
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			showReactingLoader: false,
		}

		this.updateBadgeText = this.updateBadgeText.bind(this)
	}

	updateBadgeText(pageReactions?: PageReaction[]): void {
		if (!pageReactions || pageReactions.length === 0) {
			return
		}

		const { tab } = this.state

		const topReaction = pageReactions.reduce((prev, current) => prev.count < current.count ? current : prev)

		if (topReaction.count > 0) {
			browser.browserAction.setBadgeText({ tabId: tab!.id, text: topReaction.reaction })
		} else {
			browser.browserAction.setBadgeText({ tabId: tab!.id, text: null })
		}
	}

	async componentDidMount() {
		const { emojit, themePreference } = await setupUserSettings(['emojit', 'themePreference'])
		this.setState({ emojit, themePreference })
		browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
			const pageUrl = tabs[0].url
			this.setState({ pageUrl, tab: tabs[0] })
		})

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

	render(): React.ReactNode {
		const { emojit, pageUrl, tab, themePreference } = this.state

		if (emojit === undefined || themePreference === undefined || pageUrl === undefined || tab === undefined) {
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
					pageUrl={pageUrl}

					getMessage={BrowserGetMessage}
					onPageReactions={this.updateBadgeText}
				/>
			</div>)
		}
	}
}

export default Reactions
