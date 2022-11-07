import { createNewUserId, EmojitClient, getMessage } from '@emogit/emojit-core'
import { ReactionsComponent } from '@emogit/emojit-react-core'
import React from 'react'

function Widget() {
	const parentUrl = document.referrer
	console.debug("Emojit: parentUrl", parentUrl)
	if (!parentUrl) {
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
		pageUrl={parentUrl}

		getMessage={getMessage}
	/>)
}

export default Widget
