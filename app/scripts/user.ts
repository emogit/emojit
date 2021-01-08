import { browser } from 'webextension-polyfill-ts'
import { DEFAULT_SERVICE_URL, EmojitApi } from './api'

// From https://stackoverflow.com/a/2117523/1226799
function uuidv4() {
	return (1e7.toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, cString => {
		const c = parseInt(cString, 10)
		return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	})
}

// From https://stackoverflow.com/a/14166194/1226799
export function isValidUserId(userId: string) {
	// Purposely do not bother to check for an exact match because it doesn't really matter.
	return typeof userId === 'string' && /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i.test(userId)
}

export function setupUserSettings() {
	const keys = {
		serviceUrl: DEFAULT_SERVICE_URL,
		userId: undefined,
		updateIconTextWithTopPageReaction: undefined,
	}

	return browser.storage.local.get(keys).then(async (results) => {
		const { serviceUrl } = results
		let { userId, updateIconTextWithTopPageReaction } = results
		if (!userId) {
			await browser.storage.sync.get(['userId']).then((results) => {
				userId = results.userId
				if (!userId) {
					userId = uuidv4()
					browser.storage.local.set({ userId })
					browser.storage.sync.set({ userId })
				}
			})
		}

		if (updateIconTextWithTopPageReaction === undefined) {
			await browser.storage.sync.get(['updateIconTextWithTopPageReaction']).then((results) => {
				updateIconTextWithTopPageReaction = results.updateIconTextWithTopPageReaction
				if (updateIconTextWithTopPageReaction !== undefined) {
					browser.storage.local.set({ updateIconTextWithTopPageReaction })
					browser.storage.sync.set({ updateIconTextWithTopPageReaction })
				}
			})
		}
		const emojit = new EmojitApi(serviceUrl, userId)
		return { emojit, serviceUrl, userId, updateIconTextWithTopPageReaction, }
	})
}
