import { isValidUserId, setupUserSettings } from './user'

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
			.then(response => {
				// TODO Display success.
				console.debug("Successfully deleted all of your data.")
				console.debug(response)
			}).catch(err => {
				// TODO Display error.
				console.error(err)
			})
	}
}

document.getElementById('set-user-id').onclick = function () {
	const newUserId = document.getElementById('user-id').value
	if (!isValidUserId(newUserId)) {
		// TODO Display error message.
		console.error(browser.i18n.getMessage('invalidUserId'))
		return
	}
	userId = newUserId
	const keys = { userId }
	browser.storage.local.set(keys).catch(err => {
		console.error(err)
	})
	browser.storage.sync.set(keys).catch(err => {
		console.error(err)
	})
}

document.getElementById('set-service-url').onclick = function () {
	const serviceUrl = document.getElementById('service-url').value
	const keys = {
		serviceUrl,
	}
	browser.storage.local.set(keys).then(onPageLoad)
		.catch(err => {
			console.error(err)
		})
	browser.storage.sync.set(keys).catch(err => {
		console.error(err)
	})
}

document.getElementById('export-data').onclick = function () {
	emojit.getAllData(userId).then(response => {
		download('my_data.json', JSON.stringify(response))
	}).catch(err => {
		// Already logged.
		// TODO Display error message.
	})
}

onPageLoad()
