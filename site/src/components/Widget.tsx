import { createNewUserId, EmojitClient, getMessage } from '@emogit/emojit-core'
import { ReactionsComponent } from '@emogit/emojit-react-core'
import React from 'react'
import classes from '../styles/Widget.module.css'

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
	return (<div className={classes.widgetDiv}>
		<ReactionsComponent
			emojitClient={emojit}
			pageUrl={parentUrl}

			getMessage={getMessage}
		/>
	</div>)
}

export default Widget
