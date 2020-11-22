import $ from 'jquery'

export const defaultServiceUrl = 'https://api.emojit.site'

export class EmojitApi {
	constructor(url) {
		this.url = url || defaultServiceUrl
	}

	deleteUser(request) {
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
	}

	getUserPageReactions(userId, pageUrl) {
		const startTime = new Date()
		return $.ajax({
			method: 'GET',
			url: `${this.url}/userPageReaction?userId=${encodeURIComponent(userId)}&pageUrl=${encodeURIComponent(pageUrl)}`,
			success: function (response) {
				console.debug("Page reactions:", response)
				console.debug("Getting page reactions took", new Date() - startTime, "millis.")
			},
			error: function (error) {
				console.error("Error getting user reactions.", error.status, error.responseJSON)
			}
		})
	}

	react(request) {
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
	}

	getAllData(userId) {
		return $.ajax({
			method: 'GET',
			url: `${this.url}/getAllUserData?userId=${encodeURIComponent(userId)}`,
			success: function (response) {
				console.debug("All data:", response)
			},
			error: function (error) {
				console.error("Error getting all data.", error.status, error.responseJSON)
			}
		})
	}
}