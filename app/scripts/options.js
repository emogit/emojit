import { ErrorHandler } from './error_handler'
import { isValidUserId, setupUserSettings } from './user'

const errorHandler = new ErrorHandler()

let emojit, userId

function onPageLoad() {
	setupUserSettings().then((userSettings) => {
		emojit = userSettings.emojit
		userId = userSettings.userId
		const { serviceUrl } = userSettings

		document.getElementById('user-id').value = userId
		document.getElementById('service-url').value = serviceUrl
	})
}

// From https://stackoverflow.com/a/18197341/1226799
function download(filename, text) {
	const element = document.createElement('a')
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', filename)

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()

	document.body.removeChild(element)
}

document.getElementById('delete-all-user-data').onclick = function () {
	const doDeleteUser = browser.extension.getBackgroundPage().confirm(browser.i18n.getMessage('deleteAllUserDataConfirmation'))
	if (doDeleteUser) {
		emojit.deleteUser({ userId })
			.then(_response => {
				const errorMsg = "Successfully deleted all of your data."
				errorHandler.showError({ errorMsg })
			}).catch(serviceError => {
				errorHandler.showError({ serviceError })
			})
	}
}

document.getElementById('set-user-id').onclick = function () {
	const newUserId = document.getElementById('user-id').value
	if (!isValidUserId(newUserId)) {
		const errorMsg = browser.i18n.getMessage('invalidUserId')
		errorHandler.showError({ errorMsg })
		return
	}
	userId = newUserId
	const keys = { userId }
	browser.storage.local.set(keys).catch(errorMsg => {
		errorHandler.showError({ errorMsg })
	})
	browser.storage.sync.set(keys).catch(errorMsg => {
		errorHandler.showError({ errorMsg })
	})
}

document.getElementById('set-service-url').onclick = function () {
	const serviceUrl = document.getElementById('service-url').value
	const keys = {
		serviceUrl,
	}
	browser.storage.local.set(keys).then(onPageLoad)
		.catch(errorMsg => {
			errorHandler.showError({ errorMsg })
		})
	browser.storage.sync.set(keys).catch(err => {
		errorHandler.showError({ errorMsg })
	})
}

document.getElementById('export-data').onclick = function () {
	emojit.getAllData(userId).then(response => {
		download('my_emojit_data.json', JSON.stringify(response))
	}).catch(serviceError => {
		errorHandler.showError({ serviceError })
	})
}

onPageLoad()
