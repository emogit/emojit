/**
 * Get a localized string.
 */
export interface GetMessage {
	/**
	 * Get a localized message.
	 */
	(key: string, substitutions?: any): string | undefined
}