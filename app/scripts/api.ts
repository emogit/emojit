import $ from 'jquery'
import { browser } from 'webextension-polyfill-ts'

export const DEFAULT_SERVICE_URL = 'https://api.emojit.site'

export interface PageReaction {
	reaction: string
	count: number
}

export class EmojitApi {
	urlMaxLength = 256

	constructor(public url: string, public userId: string) {
		this.url = url || DEFAULT_SERVICE_URL
	}

	checkUrl(url: string) {
		return new Promise<void>((resolve, reject) => {
			if (url.length > this.urlMaxLength) {
				reject(browser.i18n.getMessage('errorCode_URL_TOO_LONG'))
			}
			if (!/^(chrome-extension|extension|https?):\/\/.{8,}/i.test(url)) {
				reject(browser.i18n.getMessage('errorCode_INVALID_URL'))
			}
			resolve()
		})
	}

	deleteUser() {
		const request = { userId: this.userId }
		return $.ajax({
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			url: `${this.url}/user`,
			data: JSON.stringify(request),
			success: function (response) {
				console.debug("Delete response:", response)
			},
			error: function (error) {
				console.error("Error deleting user.", error.status, error.responseJSON)
			}
		})
	}

	getPageReactions(pageUrl: string): Promise<{
		userReactions: string[],
		pageReactions: PageReaction[],
	}> {
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return $.ajax({
				method: 'GET',
				url: `${this.url}/pageReactions?pageUrl=${encodeURIComponent(pageUrl)}`,
				success: function (response) {
					console.debug("Page reactions response:", response)
					console.debug("Getting page reactions took", new Date().getTime() - startTime.getTime(), "millis.")
				},
				error: function (error) {
					console.error("Error getting page reactions.", error.status, error.responseJSON)
				}
			})
		})
	}

	getUserPageReactions(pageUrl: string) {
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return $.ajax({
				method: 'GET',
				url: `${this.url}/userPageReaction?userId=${encodeURIComponent(this.userId)}&pageUrl=${encodeURIComponent(pageUrl)}`,
				success: function (response) {
					console.debug("Page reactions:", response)
					console.debug("Getting user and page reactions took", new Date().getTime() - startTime.getTime(), "millis.")
				},
				error: function (error) {
					console.error("Error getting user reactions.", error.status, error.responseJSON)
				}
			})
		})
	}

	react(request: any) {
		return this.checkUrl(request.pageUrl).then(() => {
			request.userId = this.userId
			return $.ajax({
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				url: `${this.url}/react`,
				data: JSON.stringify(request),
				success: function (response) {
					console.debug("React response:", response)
				},
				error: function (error) {
					console.error("Error reacting.", error.status, error.responseJSON)
				}
			})
		})
	}

	getAllData() {
		return $.ajax({
			method: 'GET',
			url: `${this.url}/userData?userId=${encodeURIComponent(this.userId)}`,
			success: function (response) {
				console.debug("All data:", response)
			},
			error: function (error) {
				console.error("Error getting all data.", error.status, error.responseJSON)
			}
		})
	}

	getBadges() {
		return $.ajax({
			method: 'GET',
			url: `${this.url}/badges?userId=${encodeURIComponent(this.userId)}`,
			success: function (response) {
				console.debug("Badges:", response)
			},
			error: function (error) {
				console.error("Error getting user's badges.", error.status, error.responseJSON)
			}
		})
	}
}