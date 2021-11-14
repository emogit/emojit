export enum ErrorCode {
	/**
	 * Same code for all admin stuff since it doesn't really need to be translated yet.
	 */
	ADMIN_UNAUTHORIZED,
	BADGE_ASSIGNMENT_ERROR,
	INVALID_COUNT,
	INVALID_MOD,
	INVALID_MODIFICATIONS,
	INVALID_REACTION,
	INVALID_URL,
	INVALID_USERID,
	MISSING_URL,
	MISSING_USERID,
	REACTION_EMPTY,
	REACTIONS_THROTTLED,
	TOO_MANY_REACTIONS,
	URL_TOO_LONG,
}

export function error(code: ErrorCode): string {
	return ErrorCode[code]
}
