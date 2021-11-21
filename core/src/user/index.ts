import { v4 as uuidv4 } from 'uuid'

/**
 * @param userId A user ID.
 * @returns `true` if the user ID is valid, otherwise `false`.
 */
export function isValidUserId(userId: string): boolean {
	// Purposely do not bother to check for an exact match because it doesn't really matter.
	// Regex from https://stackoverflow.com/a/14166194/1226799
	return typeof userId === 'string' && /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i.test(userId)
}

export function createNewUserId(): string {
	return uuidv4()
}