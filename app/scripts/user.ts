import { PaletteType } from '@material-ui/core'
import { browser } from 'webextension-polyfill-ts'
import { DEFAULT_SERVICE_URL, EmojitApi } from './api'

// From https://stackoverflow.com/a/2117523/1226799
export function createNewUserId(): string {
	return (1e7.toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, cString => {
		const c = parseInt(cString, 10)
		return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	})
}

export type ThemePreferenceType = PaletteType | 'device'

export interface UserSettings {
	emojit: EmojitApi
	serviceUrl: string
	userId: string
	updateIconTextWithTopPageReaction: boolean | undefined
	themePreference: ThemePreferenceType
}

export async function setupUserSettings(requiredKeys: (keyof (UserSettings))[]): Promise<UserSettings> {
	// const startTime = new Date().getTime()
	const keys = {
		serviceUrl: DEFAULT_SERVICE_URL,
		userId: undefined,
		updateIconTextWithTopPageReaction: undefined,
		themePreference: undefined,
	}

	const results = await browser.storage.local.get(keys)
	const { serviceUrl, } = results
	let { userId, updateIconTextWithTopPageReaction, themePreference } = results
	if (!userId && (requiredKeys.indexOf('userId') > -1 || requiredKeys.indexOf('emojit') > - 1)) {
		const r = await browser.storage.sync.get(['userId'])
		userId = r.userId
		if (!userId) {
			userId = createNewUserId()
			browser.storage.sync.set({ userId })
		}
		browser.storage.local.set({ userId })
	}
	if (requiredKeys.indexOf('updateIconTextWithTopPageReaction') > - 1 && updateIconTextWithTopPageReaction === undefined) {
		const r = await browser.storage.sync.get(['updateIconTextWithTopPageReaction'])
		updateIconTextWithTopPageReaction = r.updateIconTextWithTopPageReaction
		if (updateIconTextWithTopPageReaction !== undefined) {
			browser.storage.local.set({ updateIconTextWithTopPageReaction })
		}
	}
	if (requiredKeys.indexOf('themePreference') > - 1 && themePreference === undefined) {
		const r = await browser.storage.sync.get(['themePreference'])
		themePreference = r.themePreference
		if (themePreference !== undefined) {
			browser.storage.local.set({ themePreference })
		} else {
			themePreference = 'device'
		}
	}

	const result: any = { serviceUrl, userId, updateIconTextWithTopPageReaction, themePreference }
	if (requiredKeys.indexOf('emojit') > - 1) {
		result.emojit = new EmojitApi(serviceUrl, userId)
	}
	// console.debug("setupUserSettings took", new Date().getTime() - startTime, "millis for", requiredKeys.length, " key(s).")
	return result
}
