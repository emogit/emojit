import React from 'react'
import { Outlet } from 'react-router-dom'

function Layout() {
	return (<div className="App">
		<header className="App-header">
			<img src="logo128.png" className="App-logo" alt="logo" />
		</header>

		<Outlet />
	</div>)
}

export default Layout