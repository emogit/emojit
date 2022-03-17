import { progressSpinnerColor } from '@emogit/emojit-react-core'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import React from 'react'
import { getMessage } from '../i18n_helper'
import classes from '../styles/Badges.module.css'
import { setupUserSettings } from '../user'

interface Badge {
	name: string
	time: Date | null | undefined
	progress: number
	pageUrl: string | null | undefined
	currentReactions: string[] | null | undefined
}

class Badges extends React.Component<unknown, {
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
								<Typography className={classes.center} variant="h6">
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

export default Badges
