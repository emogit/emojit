import { ReactionsComponent } from '@emogit/emojit-react-core'
import React from 'react'
import ReactDOM from 'react-dom'

function onPageLoad() {
	const domContainer = document.getElementById('app-div')
	ReactDOM.render(React.createElement(ReactionsComponent), domContainer)
}

onPageLoad()
