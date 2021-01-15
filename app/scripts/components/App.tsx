import Container from '@material-ui/core/Container'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import React from 'react'
import Badges from './Badges'
import Options from './Options'

const styles = (theme: Theme) => createStyles({
	headerSection: {
		marginBottom: theme.spacing(1),
	},
	pageButton: {
		// Make it look like a button since I couldn't figure out how to remove the background color of a Button.
		cursor: 'pointer',
		textDecoration: 'none',
		padding: '4px',
		marginRight: theme.spacing(2),
		fontSize: '1.5em',
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
		this.setState({ page: 'badges' })
	}

	showOptions() {
		this.setState({ page: 'options' })
	}

	render() {
		const { classes } = this.props
		return <div>
			<Container>
				<div className={classes.headerSection}>
					<a className={classes.pageButton}
						onClick={this.showBadges}>
						🏆
					</a>
					<a className={classes.pageButton}
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