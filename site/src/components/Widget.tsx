import { createNewUserId, EmojitClient, getMessage } from '@emogit/emojit-core'
import { ReactionsComponent } from '@emogit/emojit-react-core'
import React from 'react'
import classes from '../styles/Widget.module.css'

function Widget() {
	// Prefer the iframe's referrer, otherwise default to the current page, mainly for debugging.
	// TODO Only default to current page's URL if we're not in an iframe.
	const url = document.referrer || document.location.href
	console.debug("Emojit: document.referrer:", document.referrer)
	console.debug("Emojit: url:", url)
	if (!url) {
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
			pageUrl={url}

			getMessage={getMessage}
		/>
	</div>)
}

export default Widget
