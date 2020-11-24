// browser.runtime.onInstalled.addListener((details) => {
//   console.log('previousVersion', details.previousVersion)
// })

import { setupUserSettings } from "./user"

// Keep a cache to avoid hitting the API again on every tab change and maybe avoid the "tabs" permission.
const tabInfos = {}

const cacheTimeMs = 10 * 60 * 1000

// FIXME Doesn't show badge text on page refresh.

browser.tabs.onActivated.addListener(async ({ tabId, _windowId }) => {
	// Tab changed.
	// console.debug("onActivated tabId:", tabId)
	setupUserSettings().then(async ({ emojit, updateIconTextWithTopPageReaction }) => {
		const currentBadgeText = await browser.browserAction.getBadgeText({ tabId })
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
			// Somehow the topReaction is set even though it isn't visible at first.
			tabInfo = { url, lastUpdated: 0 }
		}
		const { url, lastUpdated } = tabInfo

		let topReaction
		if (new Date() - lastUpdated < cacheTimeMs) {
			topReaction = tabInfo.topReaction
			if (topReaction === undefined) {
				topReaction = currentBadgeText
			}
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
		console.debug("setBadgeText:", topReaction)
		browser.browserAction.setBadgeText({ tabId, text: topReaction })
	})
})

browser.tabs.onRemoved.addListener(tabId => {
	delete tabInfos[tabId]
})

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// console.debug("onUpdated tabId:", tabId)
	const { url } = changeInfo
	// console.debug("changeInfo:", changeInfo)
	if (url === undefined) {
		return
	}
	// Set immediately to 
	tabInfos[tabId] = { url }
	// console.debug("changeInfo:", changeInfo)
	// console.debug("tab:", tab)

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
		console.debug("setBadgeText:", topReaction)
		browser.browserAction.setBadgeText({ tabId, text: topReaction })
		tabInfos[tabId] = { url, topReaction, lastUpdated: new Date() }
	})
})