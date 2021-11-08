// From https://stackoverflow.com/a/14166194/1226799
/**
 * @param userId A user ID.
 * @returns `true` if the user ID is valid, otherwise `false`.
 */
export function isValidUserId(userId: string): boolean {
	// Purposely do not bother to check for an exact match because it doesn't really matter.
	return typeof userId === 'string' && /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i.test(userId)
}

export function createNewUserId(): string {
	// Modified from https://stackoverflow.com/a/2117523/1226799
	return (1e7.toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, cString => {
		const c = parseInt(cString, 10)
		return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	})
}