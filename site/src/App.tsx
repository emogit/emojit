import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Layout from './components/Layout'
import Widget from './components/Widget'

function App() {
	return (<BrowserRouter>
		<Routes>
			<Route path="/widget" element={<Widget />} />
			<Route path="/" element={<Layout />}>
				<Route index element={<Home />} />
				{/* <Route path="*" element={<NoPage />} /> */}
			</Route>
		</Routes>
	</BrowserRouter>)
}

export default App
