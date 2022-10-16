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

class Reactions extends React.Component<unknown, {
	emojit?: EmojitClient
	pageUrl?: string
	tab?: browser.Tabs.Tab
	themePreference?: ThemePreferenceType
}> {
	constructor(props: any) {
		super(props)
		this.state = {}

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

		// Change the theme when the user changes the theme preference.
		// Useful if the extension is open in another window.
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

	/**
	 * Increase the size of the popup for the extension.
	 */
	expandPopup(): void {
		// TODO Add to current size if less than a certain amount.
		document.getElementById('main-popup')!.style.height = '500px'
	}

	/**
	 * Condense the size of the popup for the extension.
	 */
	condensePopup(): void {
		// TODO Get original size in componentDidMount.
		document.getElementById('main-popup')!.style.height = '320px'
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

					onReactionPickerOpened={this.expandPopup}
					onReactionPickerClosed={this.condensePopup}
				/>
			</div>)
		}
	}
}

export default Reactions
