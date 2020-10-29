import $ from 'jquery'
import { setupUserSettings } from './user'

let emojit, userId

function onPageLoad() {
	setupUserSettings().then((userSettings) => {
		emojit = userSettings.emojit
		userId = userSettings.userId
	})

	$('#delete-all-user-data')[0].onclick = function () {
		// TODO Use string from localization.
		const doDeleteUser = browser.extension.getBackgroundPage().confirm("Delete all of your data? (this cannot be undone)")
		if (doDeleteUser) {
			emojit.deleteUser({ userId }).catch(err => {
				// TODO Display error.
			})
		}
	}
}

onPageLoad()