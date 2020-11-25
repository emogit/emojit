// browser.runtime.onInstalled.addListener((details) => {
//   console.log('previousVersion', details.previousVersion)
// })

import { setupUserSettings } from "./user"

// Keep a cache to avoid hitting the API again on every tab change and maybe avoid the "tabs" permission.
const tabInfos = {}

const cacheTimeMs = 10 * 60 * 1000

// FIXME Reaction on icon is not correct if it gets cached (even as not set), then the top one changes (user reacts), then you switch back to the tab (cached one gets used).
// Fix is to not use the cache here but to use a cache in a shared cache between the background and the browser action (maybe use storage.local).

browser.tabs.onActivated.addListener(async ({ tabId, _windowId }) => {
	// Tab changed.
	console.debug("onActivated tabId:", tabId)
	setupUserSettings().then(async ({ emojit, updateIconTextWithTopPageReaction }) => {
		// const currentBadgeText = await browser.browserAction.getBadgeText({ tabId })
		// console.debug("onActivated: updateIconTextWithTopPageReaction:", updateIconTextWithTopPageReaction)
		if (!updateIconTextWithTopPageReaction) {
			return
		}

		let tabInfo = tabInfos[tabId]
		// console.debug("tabInfo:", tabInfo)
		if (tabInfo === undefined || tabInfo.url === undefined) {
			// Mainly for when the page refreshes and they return to the tab.
			// Needs "tabs" permission.
			const tabs = await browser.tabs.query({ active: true, currentWindow: true })
			if (tabs.length === 0) {
				return
			}
			const url = tabs[0].url
			if (!url) {
				return
			}
			tabInfo = { url, lastUpdated: 0 }
		}
		const { url, lastUpdated } = tabInfo

		let topReaction
		// console.debug("onActivated tabInfo:", tabInfo)
		if (new Date() - lastUpdated < cacheTimeMs && tabInfo.topReaction !== undefined) {
			topReaction = tabInfo.topReaction
		} else {
			let reactions
			try {
				// TODO Add flag to use local cache and limit to 1.
				const response = await emojit.getPageReactions(url)
				reactions = response.reactions
			} catch (err) {
				// Already logged. Ignore.
			}
			topReaction = null
			if (reactions && reactions.length) {
				topReaction = reactions[0].reaction
			}
			tabInfos[tabId] = { url, topReaction, lastUpdated: new Date() }
		}
		// console.debug("setBadgeText:", topReaction)
		browser.browserAction.setBadgeText({ tabId, text: topReaction })
	})
})

browser.tabs.onRemoved.addListener(tabId => {
	delete tabInfos[tabId]
})

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// console.debug("onUpdated tabId:", tabId)
	console.debug("onUpdated changeInfo:", changeInfo, "tab:", tab)
	// Needs "tabs" permission.
	const { status } = changeInfo
	const { url } = tab
	// Sometimes the status: 'complete' can come in multiple times.
	if (status !== 'complete' || url === undefined) {
		return
	}

	// The URL changed so we should clear the top reaction.
	browser.browserAction.setBadgeText({ tabId, text: null })

	setupUserSettings().then(async ({ emojit, updateIconTextWithTopPageReaction }) => {
		if (!updateIconTextWithTopPageReaction) {
			return
		}

		let reactions
		try {
			// TODO Add flag to use local cache and limit to 1.
			const response = await emojit.getPageReactions(url)
			reactions = response.reactions
		} catch (err) {
			// Already logged. Ignore.
			return
		}

		let topReaction = null
		if (reactions && reactions.length) {
			topReaction = reactions[0].reaction
		}
		// console.debug("setBadgeText:", topReaction)
		browser.browserAction.setBadgeText({ tabId, text: topReaction })
		tabInfos[tabId] = { url, topReaction, lastUpdated: new Date() }
	})
})