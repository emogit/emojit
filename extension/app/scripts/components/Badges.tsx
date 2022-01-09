import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { getMessage } from '../i18n_helper'
import { setupUserSettings } from '../user'
import { progressSpinnerColor } from './constants'

interface Badge {
	name: string
	time: Date | null | undefined
	progress: number
	pageUrl: string | null | undefined
	currentReactions: string[] | null | undefined
}

const styles = (theme: Theme) => createStyles({
	title: {
		marginTop: theme.spacing(1.5),
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
	},
})

class Badges extends React.Component<WithStyles<typeof styles>, {
	badges: { badges: Badge[] } | undefined,
	errorGettingBadges: string | undefined,
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			badges: undefined,
			errorGettingBadges: undefined,
		}
	}

	async componentDidMount() {
		const { emojit } = await setupUserSettings(['emojit'])
		try {
			const badges = await emojit.getBadges()
			this.setState({ badges })
		} catch (err) {
			console.error(err)
			const errorGettingBadges = getMessage('errorGettingBadges')
			this.setState({ errorGettingBadges })
		}
	}

	render(): React.ReactNode {
		const { classes } = this.props

		const badgeSummary: { [badgeName: string]: number | undefined } = {}
		if (this.state.badges !== undefined) {
			for (const badge of this.state.badges.badges) {
				if (badgeSummary[badge.name] === undefined) {
					badgeSummary[badge.name] = 1
				} else {
					badgeSummary[badge.name]! += 1
				}
			}
		}

		return <Container>
			<Typography className={classes.title} component="h4" variant="h4">
				{getMessage('badgesPageTitle') || "🏆 Badges 🎉"}
			</Typography>
			{this.state.badges === undefined && this.state.errorGettingBadges === undefined && <div className={classes.center}>
				<CircularProgress size={70} style={{ color: progressSpinnerColor }}
				/>
			</div>}
			{this.state.errorGettingBadges !== undefined &&
				<Typography color="error" variant="body2" component="p" >
					{this.state.errorGettingBadges}
				</Typography>}
			{this.state.badges !== undefined && this.state.badges.badges.length === 0 && <div>
				<Typography variant="body2" component="p" >
					{getMessage("noBadges") || "You don't have any badges yet."}
				</Typography>
			</div>}
			{this.state.badges !== undefined && this.state.badges.badges.length > 0 &&
				<Typography className={classes.title} component="h5" variant="h5">
					{getMessage('badgeSummaryTitle') || "Summary"}
				</Typography>
			}
			<Grid container className={classes.badgeGrid} spacing={3}>
				{Object.entries(badgeSummary).map(([badgeName, count], index) =>
					<Grid key={`badgeSummary-${index}`} item xs={12} sm={4} md={3}>
						<Card className={classes.card} raised={true}>
							<CardContent>
								<Typography className={`${classes.badgeName} ${classes.center}`} variant="h6">
									{getMessage(`badge_${badgeName}`) || badgeName}
								</Typography>
								<Typography className={classes.center} color="textSecondary" component="p">
									{"x "}{count}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				)}
			</Grid>
			{this.state.badges !== undefined && this.state.badges.badges.length > 0 &&
				<Typography className={classes.title} component="h5" variant="h5">
					{getMessage('yourBadgesTitle') || "Your Badges"}
				</Typography>
			}
			<Grid container className={classes.badgeGrid} spacing={3}>
				{this.state.badges !== undefined && this.state.badges.badges.map((badge, index) =>
					<Grid key={`badge-${index}`} item xs={12} sm={6} md={4}>
						<Card className={classes.card} raised={true}>
							<CardContent>
								<Typography className={classes.badgeName} variant="h6">
									{getMessage(`badge_${badge.name}`) || badge.name}
								</Typography>
								{badge.pageUrl && <Typography variant="body2" color="textSecondary" component="p">
									<Link href={badge.pageUrl} target="_blank">
										{badge.pageUrl}
									</Link>
								</Typography>}
								{badge.currentReactions && <Typography variant="body2" component="p">
									{getMessage('currentReactionsIdentifier') || "Your current reaction(s): "}{badge.currentReactions.join("")}
								</Typography>}
								{badge.time && <Typography variant="body2" component="p">
									{getMessage('earnedTimeIdentifier') || "📅 "}{new Date(badge.time).toString()}
								</Typography>}
							</CardContent>
						</Card>
					</Grid>
				)}
			</Grid>
		</Container >
	}
}

export default withStyles(styles)(Badges)
