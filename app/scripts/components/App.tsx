import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import React from 'react'
import Badges from './Badges'
import Options from './Options'
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles'

const styles = () => createStyles({
	pageButton: {
		// TODO Figure out how to actually make the button transparent.
		backgroundColor: 'inherit',
		border: 'none',
		outline: 'none',
		padding: '4px',
		margin: '2px',
		fontSize: '1.5em',
	},
})

class App extends React.Component<WithStyles<typeof styles>, {
	page: 'badges' | 'options'
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			page: 'options',
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
				<Button className={classes.pageButton} onClick={this.showBadges} >
					🏆
				</Button>
				<Button className={classes.pageButton} onClick={this.showOptions}>
					⚙️
				</Button>
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