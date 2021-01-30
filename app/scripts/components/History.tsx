import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import HistoryIcon from '@material-ui/icons/History'
import update from 'immutability-helper'
import React, { ChangeEvent } from 'react'
import { EmojitApi, PageReactions } from '../api'
import { ErrorHandler } from '../error_handler'
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
	deleteButton: {
		marginBottom: theme.spacing(0.5),
	},
	search: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
		width: '100%',
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
	},
})

class History extends React.Component<WithStyles<typeof styles>, {
	emojit: EmojitApi | undefined
	history: { pages: PageReactions[] } | undefined,
	shownHistory: { pages: PageReactions[] } | undefined,
	checkedPages: string[],
	errorGettingHistory: string | undefined,
}> {
	private errorHandler = new ErrorHandler(undefined)

	constructor(props: any) {
		super(props)
		this.state = {
			emojit: undefined,
			history: undefined,
			shownHistory: undefined,
			checkedPages: [],
			errorGettingHistory: undefined,
		}

		this.deletePages = this.deletePages.bind(this)
		this.handleDeleteCheckbox = this.handleDeleteCheckbox.bind(this)
	}

	async componentDidMount() {
		const { emojit } = await setupUserSettings(['emojit'])
		try {
			const history = await emojit.getAllUserReactions()
			this.setState({ emojit, history, shownHistory: history })
		} catch (err) {
			console.error(err)
			const errorGettingHistory = getMessage('errorGettingHistory')
			this.setState({ errorGettingHistory })
		}
	}

	handleDeleteCheckbox(event: React.ChangeEvent<HTMLInputElement>): void {
		const { checked } = event.target
		const pageUrl = event.target.name
		if (checked) {
			this.setState({
				checkedPages: update(this.state.checkedPages, { $push: [pageUrl] }),
			})
		} else {
			const index = this.state.checkedPages.indexOf(pageUrl)
			this.setState({
				checkedPages: update(this.state.checkedPages, { $splice: [[index, 1]] }),
			})
		}
	}

	async deletePages(): Promise<void> {
		if (confirm(getMessage(`deleteSelectedPagesConfirmation`))) {
			try {
				await this.state.emojit!.deleteUserReactions(this.state.checkedPages)
				this.errorHandler.showError({ errorMsg: getMessage('deleteUserPageReactionsSuccess') })
				// Soft reload.
				this.setState({ history: undefined, shownHistory: undefined, }, async () => {
					const history = await this.state.emojit!.getAllUserReactions()
					this.setState({ history, shownHistory: history })
				})
			} catch (serviceError) {
				this.errorHandler.showError({ serviceError })
			}
		}
	}

	render(): React.ReactNode {
		const { classes } = this.props

		return <Container>
			<Typography className={classes.title} component="h4" variant="h4">
				<HistoryIcon className={classes.historyIcon} color="primary" fontSize="large" />
				{getMessage('historyPageTitle') || "History"}
			</Typography>

			{this.state.history !== undefined && this.state.history.pages.length > 0 && <div>
				<Button className={classes.deleteButton}
					disabled={this.state.checkedPages.length === 0}
					color="secondary"
					variant="contained"
					onClick={this.deletePages}>
					{`Delete  ${this.state.checkedPages.length} selected`}
				</Button>

				<TextField className={classes.search}
					label="Enter a URL or emoji to search" variant="outlined"
					onChange={(event: ChangeEvent<any>) => {
						const text = (event.target.value || "").toLocaleLowerCase()
						if (text) {
							this.setState({
								shownHistory: {
									pages: this.state.history!.pages.filter(page => {
										return page.pageUrl.toLocaleLowerCase().indexOf(text) > -1 || page.currentReactions.indexOf(text) > -1
									})
								}
							})
						} else {
							this.setState({ shownHistory: this.state.history })
						}
					}}
				/>
			</div>}
			{
				this.state.shownHistory === undefined && this.state.errorGettingHistory === undefined && <div className={classes.center}>
					<CircularProgress size={70} style={{ color: progressSpinnerColor }}
					/>
				</div>
			}
			{
				this.state.history !== undefined && this.state.history.pages.length === 0 && <div>
					<Typography variant="body2" component="p" >
						{getMessage("noHistory")}
					</Typography>
				</div>
			}

			<Grid container className={classes.historyGrid} spacing={1}>
				{this.state.shownHistory !== undefined && this.state.shownHistory.pages.map((page, index) =>
					<Grid key={`page-${index}`} item xs={12}>
						<Card className={classes.card} raised={true}>
							<CardContent className={classes.cartContent}>
								<Grid container spacing={0} alignItems="center">
									<Grid item xs={1}>
										<Checkbox color="secondary"
											checked={this.state.checkedPages.indexOf(page.pageUrl) > -1}
											onChange={this.handleDeleteCheckbox}
											// Can't get custom props working.
											name={page.pageUrl}
											inputProps={{ 'aria-label': `List ${page.pageUrl} for deletion` }}
										/>
									</Grid>
									<Grid item xs={11}>
										<Typography className={classes.pageUrlP} display="inline"
											variant="body2" component="p"
										>
											<Link href={page.pageUrl} target="_blank">
												{page.pageUrl}
											</Link>
										</Typography>
										<Typography variant="body2" component="p">
											{getMessage('currentReactionsIdentifier') || "Your current reaction(s): "}{page.currentReactions.join("")}
										</Typography>
										<Typography variant="body2" component="p">
											{getMessage('earnedTimeIdentifier') || "📅 "}{new Date(page.time).toString()}
										</Typography>
										{page.badges && page.badges.length > 0 && <Typography variant="body2" component="p">
											{getMessage('badgesIdentifier') || "Your badges: "}{page.badges.map(badge => getMessage(`badge_${badge.name}`)).join(", ")}
										</Typography>}
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				)}
			</Grid>
		</Container >
	}
}

export default withStyles(styles)(History)
