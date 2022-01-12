import { PageReaction } from "@emogit/emojit-core"
import { ReactionsComponent } from "@emogit/emojit-react-core"
import React, { useEffect } from 'react'
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

export const Reactions = () => {

	function updateBadgeText(pageReactions?: PageReaction[]): void {
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


	// FIXME
	useEffect(async () => {
		const { emojit, themePreference } = await setupUserSettings(['emojit', 'themePreference'])

		browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
			const pageUrl = tabs[0].url
			// this.setState({ pageUrl, tab: tabs[0] })
		})
	})
	// FIXME Use EmojitTheme, add buttons for history, badges, etc.
	return (<div>
		<ReactionsComponent emojitClient={emojit} themePreference={themePreference} />
	</div>)
}