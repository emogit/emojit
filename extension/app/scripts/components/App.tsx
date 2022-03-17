import { EmojitTheme, ThemePreferenceType } from '@emogit/emojit-react-core'
import HistoryIcon from '@mui/icons-material/History'
import Container from '@mui/material/Container'
import React from 'react'
import browser from 'webextension-polyfill'
import classes from '../styles/App.module.css'
import { updateUrl } from '../url_helper'
import { setupUserSettings } from '../user'
import Badges from './Badges'
import History from './History'
import Options from './Options'


class App extends React.Component<unknown, {
	page: string
	themePreference?: ThemePreferenceType
}> {
	constructor(props: any) {
		super(props)
		const urlParams = new URLSearchParams(window.location.search)
		const page: string = urlParams.get('page') || 'options'
		this.state = {
			page,
		}

		this.showBadges = this.showBadges.bind(this)
		this.showOptions = this.showOptions.bind(this)
		this.showHistory = this.showHistory.bind(this)
	}

	async componentDidMount() {
		const { themePreference } = await setupUserSettings(['themePreference'])
		this.setState({ themePreference })

		browser.storage.onChanged.addListener((changes, areaName) => {
			if (areaName === 'local' && changes.themePreference) {
				const themePreference = changes.themePreference.newValue
				if (themePreference !== this.state.themePreference) {
					this.setState({
						themePreference,
					})
				}
			}
		})
	}

	showBadges() {
		const page = 'badges'
		this.setState({ page })
		updateUrl({ page })
	}

	showHistory() {
		const page = 'history'
		this.setState({ page })
		updateUrl({ page })
	}

	showOptions() {
		const page = 'options'
		this.setState({ page })
		updateUrl({ page })
	}

	render(): React.ReactNode {
		const { themePreference } = this.state

		return <div>
			<EmojitTheme themePreference={themePreference}>
				<Container>
					<div className={`${classes.headerSection} ${classes.end}`}>
						<a className={`${classes.pageButton} ${classes.historyButton} ${this.state.page === 'history' ? classes.selectedPageButton : ''}`}
							onClick={this.showHistory}>
							<HistoryIcon color="primary" />
						</a>
						<a className={`${classes.pageButton} ${this.state.page === 'badges' ? classes.selectedPageButton : ''}`}
							onClick={this.showBadges}>
							🏆
						</a>
						<a className={`${classes.pageButton} ${this.state.page === 'options' ? classes.selectedPageButton : ''}`}
							onClick={this.showOptions}>
							⚙️
						</a>
					</div>
				</Container>
				{this.page()}
			</EmojitTheme>
		</div>
	}

	private page(): JSX.Element {
		switch (this.state.page) {
			case 'badges':
				return <Badges />
			case 'history':
				return <History />
			case 'options':
				return <Options />
		}
		// Shouldn't happen.
		return <div></div>
	}
}

export default App