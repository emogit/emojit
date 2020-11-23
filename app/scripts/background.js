// browser.runtime.onInstalled.addListener((details) => {
//   console.log('previousVersion', details.previousVersion)
// })

// browser.browserAction.setBadgeText({
//   text: `'Allo`
// })

browser.tabs.onActiveChanged.addListener((_tabId, _selectInfo) => {
	setupUserSettings().then(({ emojit, updateIconTextWithTopPageReaction }) => {
		if (!updateIconTextWithTopPageReaction) {
			return
		}
		browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
			if (tabs.length === 0) {
				return
			}
			pageUrl = tabs[0].url
			if (!pageUrl) {
				return
			}

			let reactions
			try {
				const response = await emojit.getPageReactions(pageUrl)
				reactions = response.reactions
			} catch (err) {
				// Already logged. Ignore.
			}
			if (reactions && reactions.length) {
				browser.browserAction.setBadgeText({ text: reactions[0].reaction })
			}
		})
	})
})