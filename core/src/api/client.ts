import axios from 'axios'
import { URL } from 'url'
import { EmojitError, ErrorCode } from '../error/error'
import { isValidUserId } from '../user'
import { Badge, BadgeAssignerResponse, BadgeInfo } from './badge'

export const DEFAULT_SERVICE_URL = 'https://api.emojit.site'

export class PageReaction {
	constructor(public reaction: string, public count: number) { }
}

export class ReactionModification {
	constructor(public reaction: string, public count: number) { }
}

export interface PageReactions {
	pageUrl: string
	currentReactions: string[]
	time: Date
	badges: BadgeInfo[]
}

export class ReactRequest {
	/**
	 * @param pageUrl The URL of the page the user is reacting to.
	 * @param modifications The update to make. `count` must be an integer and can be negative.
	 * @param userId An identifier for the user. If not given, then the client will set it.
	 */
	constructor(
		public pageUrl: string,
		public modifications: ReactionModification[],
		public userId: string | undefined = undefined) { }
}

export class ReactResponse {
	/**
	 * @param reactions The current latest reactions for that user on the page.
	 * @param badges Badges earned by the user for the reaction they made for the request.
	 */
	constructor(
		public reactions: string[],
		public badges: BadgeAssignerResponse,
	) { }
}
export class UserPageReactionRequest {
	constructor(public userId: string, public pageUrl: string) { }
}

export class UserPageReactionResponse {
	constructor(public userReactions: string[], public pageReactions: PageReaction[]) { }
}

export class PageReactionsRequest {
	constructor(public pageUrl: string) { }
}

export class PageReactionsResponse {
	/**
	 * @param reactions The reactions on the page URL for the request.
	 */
	constructor(public reactions: PageReaction[]) { }
}

export class GetAllUserDataRequest {
	constructor(public userId: string) { }
}

export class GetAllUserDataResponse {
	constructor(public reactions: any[], public historicalReactions: any[], public badges: UserBadgesResponse) { }
}

export class DeleteUserRequest {
	constructor(public userId: string) { }
}

export class DeleteUserResponse {
	constructor(public success = true) { }
}

export class DeleteUserPageReactionsRequest {
	constructor(public userId: string, public pageUrls: string[]) { }
}

export class DeleteUserPageReactionsResponse {
	constructor(public success = true) { }
}

export class UserBadgesRequest {
	constructor(public userId: string) { }
}

export class UserBadgesResponse {
	constructor(public badges: Badge[] = []) { }
}

export class BadgeTypesResponse {
	constructor(public badges: BadgeInfo[] = []) { }
}

/**
 * The reactions that a user had to a specific page URL.
 */
export class PageReactions {
	constructor(
		public pageUrl: string,
		public currentReactions: string[],
		public time: Date,
		public badges: BadgeInfo[]) { }
}

export class UserReactionsResponse {
	constructor(public pages: PageReactions[]) { }
}

export class ComputeBadgesResponse {
	constructor(public numBadgesDiff: number, public newBadgeCounts: { [badgeName: string]: number }) { }
}

export class StatsResponse {
	constructor(public stats: { [statName: string]: any }) { }
}

export class EmojitClient {
	urlMaxLength = 256

	constructor(public userId: string, public url: string = '') {
		this.url = url || DEFAULT_SERVICE_URL
		if (!isValidUserId(userId)) {
			throw new EmojitError(ErrorCode.INVALID_USERID)
		}
	}

	checkUrl(url: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (url.length > this.urlMaxLength) {
				reject(new EmojitError(ErrorCode.URL_TOO_LONG))
			}
			if (!/^(brave|chrome|chrome-extension|edge|extension|https?):\/\/./i.test(url)) {
				reject(new EmojitError(ErrorCode.INVALID_URL))
			}
			resolve()
		})
	}

	normalizeUrl(pageUrl: string): string {
		if (pageUrl) {
			// Make sure "/" is added to the end like the extension did originally.
			// This ensures that the widget which was getting URLs with no "/" at the end from
			// `document.referrer` or `document.location.ancestorOrigins` will find the same data as the extension.
			return new URL(pageUrl).toString()
		}

		return pageUrl
	}

	deleteUser(): Promise<DeleteUserResponse> {
		const request = { userId: this.userId }
		return axios({
			method: 'DELETE',
			url: `${this.url}/user`,
			responseType: 'json',
			data: request,
		}).then(response => {
			// console.debug("Delete response:", response.data)
			return response.data
		}).catch(error => {
			// See https://www.npmjs.com/package/axios#handling-errors for details about handling errors.
			console.error("Error deleting user.", error.response || error)
			throw error.response ? (error.response.data || error.response) : error
		})
	}

	deleteUserReactions(pageUrls: string[]): Promise<DeleteUserPageReactionsResponse> {
		pageUrls = pageUrls.map(this.normalizeUrl)
		const request = { userId: this.userId, pageUrls }
		return axios({
			method: 'DELETE',
			url: `${this.url}/userPageReactions`,
			responseType: 'json',
			data: request,
		}).then(response => {
			// console.debug("Delete page reactions response:", response.data)
			return response.data
		}).catch(error => {
			console.error("Error deleting user page reactions.", error)
			throw error
		})
	}

	getPageReactions(pageUrl: string): Promise<PageReactionsResponse> {
		pageUrl = this.normalizeUrl(pageUrl)
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return axios({
				method: 'GET',
				url: `${this.url}/pageReactions?pageUrl=${encodeURIComponent(pageUrl)}`,
				responseType: 'json',
			}).then(response => {
				// console.debug("Page reactions response:", response.data)
				console.debug("Getting page reactions took", new Date().getTime() - startTime.getTime(), "millis.")
				return response.data
			}).catch(error => {
				console.error("Error getting page reactions.", error)
				throw error
			})
		})
	}

	getUserPageReactions(pageUrl: string): Promise<UserPageReactionResponse> {
		pageUrl = this.normalizeUrl(pageUrl)
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return axios({
				method: 'GET',
				url: `${this.url}/userPageReaction?userId=${encodeURIComponent(this.userId)}&pageUrl=${encodeURIComponent(pageUrl)}`,
				responseType: 'json',
			}).then(response => {
				// console.debug("Page reactions:", response.data)
				console.debug("Getting user and page reactions took", new Date().getTime() - startTime.getTime(), "millis.")
				return response.data
			}).catch(error => {
				console.error("Error getting user reactions.", error)
				throw error
			})
		})
	}

	/**
	 * Get all of the user's CURRENT reactions.
	 */
	getAllUserReactions(): Promise<UserReactionsResponse> {
		const startTime = new Date()
		return axios({
			method: 'GET',
			url: `${this.url}/userReactions?userId=${encodeURIComponent(this.userId)}`,
			responseType: 'json',
		}).then(response => {
			// console.debug("All reactions:", response.data)
			console.debug("Getting all of the user's reactions took", new Date().getTime() - startTime.getTime(), "millis.")
			return response.data
		}).catch(error => {
			console.error("Error getting all of the user's reactions.", error)
			throw error
		})
	}

	react(request: ReactRequest): Promise<ReactResponse> {
		request.pageUrl = this.normalizeUrl(request.pageUrl)
		return this.checkUrl(request.pageUrl).then(() => {
			request.userId = this.userId
			return axios({
				method: 'POST',
				url: `${this.url}/react`,
				responseType: 'json',
				data: request,
			}).then(response => {
				// console.debug("React response:", response.data)
				return response.data
			}).catch(error => {
				console.error("Error reacting.", error)
				throw error
			})
		})
	}

	getAllData(): Promise<GetAllUserDataResponse> {
		return axios({
			method: 'GET',
			url: `${this.url}/userData?userId=${encodeURIComponent(this.userId)}`,
			responseType: 'json',
		}).then(response => {
			// console.debug("All data:", response.data)
			return response.data
		}).catch(error => {
			console.error("Error getting all data.", error)
			throw error
		})
	}

	getBadges(): Promise<UserBadgesResponse> {
		return axios({
			method: 'GET',
			url: `${this.url}/badges?userId=${encodeURIComponent(this.userId)}`,
			responseType: 'json',
		}).then(response => {
			// console.debug("Badges:", response.data)
			return response.data
		}).catch(error => {
			console.error("Error getting user's badges.", error.status, error.responseJSON)
			throw error
		})
	}
}