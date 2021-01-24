import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import HistoryIcon from '@material-ui/icons/History'
import React from 'react'
import { PageReactions } from '../api'
import { getMessage } from '../i18n_helper'
import { setupUserSettings } from '../user'
import { progressSpinnerColor } from './constants'

const styles = (theme: Theme) => createStyles({
	historyIcon: {
		marginRight: theme.spacing(1),
		position: 'relative',
		top: '5px',
	},
	title: {
		marginTop: theme.spacing(1.5),
		marginBottom: theme.spacing(1),
	},
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	pageUrlP: {
		fontSize: '1.3em',
	},
	historyGrid: {
		flexGrow: 1,
	},
	card: {
		height: '100%',
		wordBreak: 'break-word',
	},
	cartContent: {
		padding: '12px !important',
		// paddingBottom: '8px !important',
	},
})

class History extends React.Component<WithStyles<typeof styles>, {
	history: { pages: PageReactions[] } | undefined,
	errorGettingHistory: string | undefined,
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			history: undefined,
			errorGettingHistory: undefined,
		}
	}

	async componentDidMount() {

		const { emojit } = await setupUserSettings()
		try {
			const history = await emojit.getAllUserReactions()
			this.setState({ history })
		} catch (err) {
			console.error(err)
			const errorGettingHistory = getMessage('errorGettingHistory')
			this.setState({ errorGettingHistory })
		}
	}

	render(): React.ReactNode {
		const { classes } = this.props

		return <Container>
			<Typography className={classes.title} component="h4" variant="h4">
				<HistoryIcon className={classes.historyIcon} color="primary" fontSize="large" />
				{getMessage('historyPageTitle') || "History"}
			</Typography>
			{this.state.history === undefined && this.state.errorGettingHistory === undefined && <div className={classes.center}>
				<CircularProgress size={70} style={{ color: progressSpinnerColor }}
				/>
			</div>}
			{this.state.history !== undefined && this.state.history.pages.length === 0 && <div>
				<Typography variant="body2" component="p" >
					{getMessage("noHistory")}
				</Typography>
			</div>}

			<Grid container className={classes.historyGrid} spacing={1}>
				{this.state.history !== undefined && this.state.history.pages.map((page, index) =>
					<Grid key={`page-${index}`} item xs={12}>
						<Card className={classes.card} raised={true}>
							<CardContent className={classes.cartContent}>
								{page.pageUrl && <Typography className={classes.pageUrlP}
									variant="body2" component="p"
								>
									<Link href={page.pageUrl} target="_blank">
										{page.pageUrl}
									</Link>
								</Typography>}
								{page.currentReactions && <Typography variant="body2" component="p">
									{getMessage('currentReactionsIdentifier') || "Your current reaction(s): "}{page.currentReactions.join("")}
								</Typography>}
								{page.time && <Typography variant="body2" component="p">
									{getMessage('earnedTimeIdentifier') || "📅 "}{new Date(page.time).toString()}
								</Typography>}
								{page.badges && page.badges.length > 0 && <Typography variant="body2" component="p">
									{getMessage('badgesIdentifier') || "Your badges: "}{page.badges.map(badge => getMessage(`badge_${badge.name}`)).join(", ")}
								</Typography>}
							</CardContent>
						</Card>
					</Grid>
				)}
			</Grid>
		</Container >
	}
}

export default withStyles(styles)(History)
