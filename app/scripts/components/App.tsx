import Container from '@material-ui/core/Container'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import React from 'react'
import { updateUrl } from '../url-helper'
import Badges from './Badges'
import Options from './Options'

const styles = (theme: Theme) => createStyles({
	headerSection: {
		marginBottom: theme.spacing(1),
	},
	end: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
	},
	pageButton: {
		// Make it look like a button since I couldn't figure out how to remove the background color of a Button.
		cursor: 'pointer',
		textDecoration: 'none',
		padding: '4px',
		marginRight: theme.spacing(2),
		fontSize: '1.5em',
		opacity: 0.4,
	},
	selectedPageButton: {
		opacity: 1,
	},
})

class App extends React.Component<WithStyles<typeof styles>, {
	page: string
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
	}

	showBadges() {
		const page = 'badges'
		this.setState({ page })
		updateUrl({ page })
	}

	showOptions() {
		const page = 'options'
		this.setState({ page })
		updateUrl({ page })
	}

	render() {
		const { classes } = this.props
		return <div>
			<Container>
				<div className={`${classes.headerSection} ${classes.end}`}>
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
		</div>
	}

	private page() {
		switch (this.state.page) {
			case 'badges':
				return <Badges />
			case 'options':
				return <Options />
		}
	}
}

export default withStyles(styles)(App)