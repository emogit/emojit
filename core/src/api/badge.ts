export enum BadgeName {
	/**
	 * The first reaction for a URL.
	 */
	FIRST_REACTION = "FIRST_REACTION",

	/**
	 * A user for one year.
	 */
	ONE_YEAR = "ONE_YEAR",

	ONE_HUNDRED_PAGES = "ONE_HUNDRED_PAGES",

	ONE_HUNDRED_EMOJIS = "ONE_HUNDRED_EMOJIS",

	ONE_HUNDRED_BADGES = "ONE_HUNDRED_BADGES",
}

/**
 * A badge that a user can earn.
 */
export class BadgeInfo {
	constructor(
		public name: BadgeName) { }
}

/**
 * An badge assigned to a user.
 */
export class Badge {
	/**
	 * @param name The name for this badge.
	 * @param time If the progress is 1, then this is the time that the badge was earned.
	 * @param progress The progress towards earning this badge. Range: [0,1].
	 * @param pageUrl If the badge was earned for a specific page,
	 * then this is the page URL for which the badge was earned.
	 * @param currentReactions If the badge was earned for a specific page,
	 * then this is the user's current reactions for that page URL.
	 */
	constructor(
		public name: BadgeName,
		public time: Date | null | undefined,
		public progress: number,
		public pageUrl: string | null | undefined,
		public currentReactions: string[] | null | undefined) { }
}

export class BadgeAssignerResponse {
	constructor(public newBadges: Badge[]) { }
}
