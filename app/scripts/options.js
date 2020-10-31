import { setupUserSettings } from './user'

let emojit, userId

function onPageLoad() {
	setupUserSettings().then((userSettings) => {
		emojit = userSettings.emojit
		userId = userSettings.userId
	})

	document.getElementById('delete-all-user-data').onclick = function () {
		const doDeleteUser = browser.extension.getBackgroundPage().confirm(browser.i18n.getMessage('deleteAllUserDataConfirmation'))
		if (doDeleteUser) {
			emojit.deleteUser({ userId }).catch(err => {
				// TODO Display error.
			})
		}
	}
}

onPageLoad()