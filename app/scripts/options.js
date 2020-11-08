import { isValidUserId, setupUserSettings } from './user'

let emojit, userId

function onPageLoad() {
	setupUserSettings().then((userSettings) => {
		emojit = userSettings.emojit
		userId = userSettings.userId
	})
}

function deleteAllUserData() {
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

function setUserId() {
	const newUserId = document.getElementById('userId').value
	if (isValidUserId(newUserId)) {
		// TODO Display error message.
		console.error(browser.i18n.getMessage('invalidUserId'))
		return
	}
	const keys = {
		userId: newUserId
	}
	browser.storage.local.set(keys).catch(err => {
		console.error(err)
	})
	browser.storage.sync.set(keys).catch(err => {
		console.error(err)
	})
}

function exportData() {
	// TODO
}


onPageLoad()