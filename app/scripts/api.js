import $ from 'jquery'

export const DEFAULT_SERVICE_URL = 'https://api.emojit.site'

export class EmojitApi {
	urlMaxLength = 256

	constructor(url, userId) {
		this.url = url || DEFAULT_SERVICE_URL
		this.userId = userId
	}

	checkUrl(url) {
		return new Promise((resolve, reject) => {
			if (url.length > this.urlMaxLength) {
				console.log("URL TOO long")
				reject(browser.i18n.getMessage('urlTooLong') || "The URL is too long. It might contain private information.")
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

	getPageReactions(pageUrl) {
		return this.checkUrl(pageUrl).then(() => {
			return $.ajax({
				method: 'GET',
				url: `${this.url}/pageReactions?pageUrl=${encodeURIComponent(pageUrl)}`,
				success: function (response) {
					console.debug("Page reactions response:", response)
				},
				error: function (error) {
					console.error("Error getting page reactions.", error.status, error.responseJSON)
				}
			})
		})
	}

	getUserPageReactions(pageUrl) {
		return this.checkUrl(pageUrl).then(() => {
			const startTime = new Date()
			return $.ajax({
				method: 'GET',
				url: `${this.url}/userPageReaction?userId=${encodeURIComponent(this.userId)}&pageUrl=${encodeURIComponent(pageUrl)}`,
				success: function (response) {
					console.debug("Page reactions:", response)
					console.debug("Getting page reactions took", new Date() - startTime, "millis.")
				},
				error: function (error) {
					console.error("Error getting user reactions.", error.status, error.responseJSON)
				}
			})
		})
	}

	react(request) {
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
			url: `${this.url}/getAllUserData?userId=${encodeURIComponent(this.userId)}`,
			success: function (response) {
				console.debug("All data:", response)
			},
			error: function (error) {
				console.error("Error getting all data.", error.status, error.responseJSON)
			}
		})
	}
}