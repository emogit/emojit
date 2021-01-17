import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import Link from '@material-ui/core/Link'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { getMessage } from '../i18n_helper'
import { setupUserSettings } from '../user'
import { progressSpinnerColor } from './constants'

interface Badge {
	key: number
	name: string
	time: Date | null | undefined
	progress: number
	pageUrl: string | null | undefined
	reactions: string[]
}

const styles = (theme: Theme) => createStyles({
	title: {
		marginBottom: theme.spacing(1),
	},
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	badgeGrid: {
		flexGrow: 1,
	},
	card: {
		height: '100%',
		wordBreak: 'break-word',
	},
	badgeName: {
		fontSize: 14,
		marginBottom: theme.spacing(1),
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
			<Typography className={classes.title} component="h4" variant="h4">
				{getMessage("badgesPageTitle") || "🏆 Badges"}
			</Typography>
			{this.state.badges === undefined && <div className={classes.center}>
				<CircularProgress size={70} style={{ color: progressSpinnerColor }}
				/>
			</div>}
			{/* TODO Add summary. */}
			<Grid container className={classes.badgeGrid} spacing={2}>
				{this.state.badges !== undefined && this.state.badges.badges.map((badge, index) =>
					<Grid key={`badge-${index}`} item xs={12} md={4}>
						<Card className={classes.card} variant="outlined">
							<CardContent>
								<Typography className={classes.badgeName}>
									{getMessage(`badge_${badge.name}`) || badge.name}
								</Typography>
								{badge.pageUrl && <Typography variant="body2" color="textSecondary" component="p">
									<Link href={badge.pageUrl} target="_blank">{badge.pageUrl}</Link>
								</Typography>}
								{badge.reactions && <Typography variant="body2" component="p">
									{badge.reactions.join(" ")}
								</Typography>}
							</CardContent>
						</Card>
					</Grid>
				)}
			</Grid>
		</Container>
	}
}

export default withStyles(styles)(Badges)
