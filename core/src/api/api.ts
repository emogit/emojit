import axios from 'axios'
import { error, ErrorCode } from '../error/error'
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
     * @param userId An identifier for the user.
     * @param pageUrl The URL of the page the user is reacting to.
     * @param modifications The update to make. `count` must be an integer and can be negative.
     */
	constructor(
		public userId: string,
		public pageUrl: string,
		public modifications: ReactionModification[]) { }
}

export class ReactResponse {
	/**
     * @param reactions The updated reactions for that user on the page.
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

export class EmojitApi {
	urlMaxLength = 256

	constructor(public url: string, public userId: string) {
		this.url = url || DEFAULT_SERVICE_URL
	}

	// TODO Set error type?
	checkUrl(url: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (url.length > this.urlMaxLength) {
				reject({ errorCode: error(ErrorCode.URL_TOO_LONG) })
			}
			if (!/^(brave|chrome|chrome-extension|edge|extension|https?):\/\/./i.test(url)) {
				reject({ errorCode: error(ErrorCode.INVALID_URL) })
			}
			resolve()
		})
	}

	deleteUser(): Promise<DeleteUserResponse> {
		const request = { userId: this.userId }
		return axios({
			method: 'DELETE',
			url: `${this.url}/user`,
			responseType: 'json',
			data: request,
		}).then(response => {
			console.debug("Delete response:", response)
			return response.data
		}).catch(error => {
			// See https://www.npmjs.com/package/axios#handling-errors for details about handling errors.
			console.error("Error deleting user.", error)
			throw error
		})
	}

	deleteUserReactions(pageUrls: string[]): Promise<DeleteUserPageReactionsResponse> {
		const request = { userId: this.userId, pageUrls }
		return axios({
			method: 'DELETE',
			url: `${this.url}/userPageReactions`,
			responseType: 'json',
			data: request,
		}).then(response => {
			console.debug("Delete page reactions response:", response)
			return response.data
		}).catch(error => {
			console.error("Error deleting user page reactions.", error)
			throw error
		})
	}

	getPageReactions(pageUrl: string): Promise<PageReactionsResponse> {
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return axios({
				method: 'GET',
				url: `${this.url}/pageReactions?pageUrl=${encodeURIComponent(pageUrl)}`,
				responseType: 'json',
			}).then(response => {
				console.debug("Page reactions response:", response)
				console.debug("Getting page reactions took", new Date().getTime() - startTime.getTime(), "millis.")
				return response.data
			}).catch(error => {
				console.error("Error getting page reactions.", error)
				throw error
			})
		})
	}

	getUserPageReactions(pageUrl: string): Promise<UserPageReactionResponse> {
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return axios({
				method: 'GET',
				url: `${this.url}/userPageReaction?userId=${encodeURIComponent(this.userId)}&pageUrl=${encodeURIComponent(pageUrl)}`,
				responseType: 'json',
			}).then(response => {
				console.debug("Page reactions:", response)
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
			console.debug("All reactions:", response)
			console.debug("Getting all of the user's reactions took", new Date().getTime() - startTime.getTime(), "millis.")
			return response.data
		}).catch(error => {
			console.error("Error getting all of the user's reactions.", error)
			throw error
		})
	}

	react(request: ReactRequest): Promise<ReactResponse> {
		return this.checkUrl(request.pageUrl).then(() => {
			request.userId = this.userId
			return axios({
				method: 'POST',
				url: `${this.url}/react`,
				responseType: 'json',
				data: request,
			}).then(response => {
				console.debug("React response:", response)
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
			console.debug("All data:", response)
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
			console.debug("Badges:", response)
			return response.data
		}).catch(error => {
			console.error("Error getting user's badges.", error.status, error.responseJSON)
			throw error
		})
	}
}