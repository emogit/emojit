// browser.runtime.onInstalled.addListener((details) => {
//   console.log('previousVersion', details.previousVersion)
// })

import browser from 'webextension-polyfill'
import { setupUserSettings } from './user'

// Keep a cache to avoid hitting the API again on every tab change and maybe avoid the "tabs" permission.
interface TabInfo {
	url: string
	topReaction?: string | null
	lastUpdated: number
}
const tabInfos: { [tabId: number]: TabInfo } = {}

const cacheTimeMs = 10 * 60 * 1000

browser.tabs.onActivated.addListener(async ({ tabId, }) => {
	// Tab changed.
	// console.debug("onActivated tabId:", tabId)
	const { emojit, updateIconTextWithTopPageReaction } = await setupUserSettings(['emojit', 'updateIconTextWithTopPageReaction'])
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
	const currentTime = new Date().getTime()
	const needsUpdate = currentTime - lastUpdated > cacheTimeMs
	const currentBadgeText = await browser.browserAction.getBadgeText({ tabId })
	if (!needsUpdate && currentBadgeText) {
		// Keep the current text.
		return
	}

	let topReaction
	// console.debug("onActivated tabInfo:", tabInfo)
	if (!needsUpdate && tabInfo.topReaction !== undefined) {
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
		tabInfos[tabId] = { url, topReaction, lastUpdated: new Date().getTime() }
	}
	// console.debug("setBadgeText:", topReaction)
	browser.browserAction.setBadgeText({ tabId, text: topReaction })
})

browser.tabs.onRemoved.addListener(tabId => {
	delete tabInfos[tabId]
})

// Needs "tabs" permission.
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	// console.debug("onUpdated tabId:", tabId)
	console.debug("onUpdated changeInfo:", changeInfo, "tab:", tab)
	const { status } = changeInfo
	const { url } = tab
	// Sometimes the status: 'complete' can come in multiple times.
	if (status !== 'complete' || url === undefined) {
		return
	}

	// The URL changed so we should clear the top reaction.
	browser.browserAction.setBadgeText({ tabId, text: null })

	const { emojit, updateIconTextWithTopPageReaction } = await setupUserSettings(['emojit', 'updateIconTextWithTopPageReaction'])
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
	tabInfos[tabId] = { url, topReaction, lastUpdated: new Date().getTime() }
})