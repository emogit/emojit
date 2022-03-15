import React from 'react'
import { Outlet } from 'react-router-dom'
import logo from '../../public/logo128.png'

function Layout() {
	return (<div className="App">
		<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
		</header>

		<Outlet />
	</div>)
}

export default Layout