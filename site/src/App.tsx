import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Layout from './components/Layout'
import Widget from './components/Widget'

function App() {
	return (<BrowserRouter>
		<Routes>
			{/* Default to the widget, mainly so that it works on GitHub pages. */}
			{/* We can look into ways to load different pages, but for now having the default work for the widget is fine. */}
			<Route path="/" element={<Widget />} />
			<Route path="/widget" element={<Widget />} />
			<Route path="/home" element={<Layout />}>
				<Route index element={<Home />} />
				{/* <Route path="*" element={<NoPage />} /> */}
			</Route>
		</Routes>
	</BrowserRouter>)
}

export default App
