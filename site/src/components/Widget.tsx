import { createNewUserId, EmojitClient, getMessage } from '@emogit/emojit-core'
import { ReactionsComponent } from '@emogit/emojit-react-core'
import React from 'react'

function Widget() {
	const currentUrl = document.referrer
		|| (document.location.ancestorOrigins.length > 0 && document.location.ancestorOrigins[document.location.ancestorOrigins.length - 1])
	console.debug("Emojit: currentUrl", currentUrl)
	if (!currentUrl) {
		return <>{"Error getting the page's URL."}</>
	}
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
