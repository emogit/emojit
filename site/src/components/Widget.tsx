import { createNewUserId, EmojitClient, getMessage } from '@emogit/emojit-core'
import { ReactionsComponent } from '@emogit/emojit-react-core'
import React from 'react'

function Widget() {
	const currentUrl = document.baseURI
	console.debug("currentUrl", currentUrl)
	const userIdKey = 'userId'
	let userId = localStorage.getItem(userIdKey)
	if (!userId) {
		userId = createNewUserId()
		localStorage.setItem('userId', userId)
	}
	const emojit = new EmojitClient(userId)
	return (<ReactionsComponent
		emojitClient={emojit}
		pageUrl={currentUrl}

		getMessage={getMessage}
	/>)
}

export default Widget
