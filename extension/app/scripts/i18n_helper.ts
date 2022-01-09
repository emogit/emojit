import browser from 'webextension-polyfill'
import { GetMessage } from '@emogit/emojit-core'

export function getMessage(key: string, substitutions?: any): string | undefined {
	return browser.i18n.getMessage(key, substitutions)
}

export const BrowserGetMessage: GetMessage = getMessage