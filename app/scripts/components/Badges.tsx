import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { getMessage } from '../i18n_helper'
import { setupUserSettings } from '../user'

interface Badge {
	key: number
	name: string
	time: Date | undefined
	progress: number
}

const styles = () => createStyles({
	card: {
		minWidth: 275,
	},
	title: {
		fontSize: 14,
	},
})

class Badges extends React.Component<WithStyles<typeof styles>, {
	badges: { badges: Badge[] } | undefined,
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			badges: undefined,
		}
	}

	async componentDidMount() {
		const { emojit } = await setupUserSettings()
		const badges = await emojit.getBadges()
		this.setState({ badges })
	}

	render(): React.ReactNode {
		const { classes } = this.props
		return <Container>
			<Typography component="h4" variant="h4">
				Badges
		 	</Typography>
			{this.state.badges === undefined && <div>
				{/* TODO Add loading spinner. */}
			</div>}
			{this.state.badges !== undefined && this.state.badges.badges.map(badge =>
				<Card key={`badge-${badge.key}`} className={classes.card} variant="outlined">
					<CardContent>
						<Typography className={classes.title}>
							{getMessage(badge.name) || badge.name}
						</Typography>
					</CardContent>
				</Card>
			)}
		</Container>
	}
}

export default withStyles(styles)(Badges)
