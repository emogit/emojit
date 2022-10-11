/**
 * Get a localized string.
 */
export interface GetMessage {
	/**
	 * Get a localized message.
	 */
	(key: string, substitutions?: any): string | undefined
}

export const getMessage: GetMessage = (key: string, substitutions?: any): string | undefined => {
	// TODO Move localization files from the extension to here and use them.
	return key
}