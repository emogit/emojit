import { EmojitClient, PageReactions, UserReactionsResponse } from '@emogit/emojit-core'
import { ErrorHandler, progressSpinnerColor } from '@emogit/emojit-react-core'
import HistoryIcon from '@mui/icons-material/History'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import update from 'immutability-helper'
import React, { ChangeEvent } from 'react'
import { BrowserGetMessage, getMessage } from '../i18n_helper'
import classes from '../styles/History.module.css'
import { setupUserSettings } from '../user'

interface ReactionCount {
	reaction: string
	count: number
}

class History extends React.Component<unknown, {
	emojit?: EmojitClient
	history?: { pages: PageReactions[] }
	shownHistory?: { pages: PageReactions[] }
	/** The URLs for the pages that the user has selected (checked off). */
	checkedPages: string[]
	reactionCounts?: ReactionCount[]
	errorGettingHistory?: string
}> {
	private errorHandler = new ErrorHandler(BrowserGetMessage)

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
			const reactionCounts = this.getReactionCounts(history)
			this.setState({ emojit, history, shownHistory: history, reactionCounts })
		} catch (err) {
			console.error(err)
			const errorGettingHistory = getMessage('errorGettingHistory')
			this.setState({ errorGettingHistory })
		}
	}

	private getReactionCounts(history: UserReactionsResponse) {
		const reactionsCounter = new Map<string, number>()
		for (const page of history.pages) {
			for (const reaction of page.currentReactions) {
				if (reactionsCounter.has(reaction)) {
					reactionsCounter.set(reaction, reactionsCounter.get(reaction)! + 1)
				} else {
					reactionsCounter.set(reaction, 1)
				}
			}
		}
		const reactionCounts = Array.from(reactionsCounter.entries()).map(([reaction, count]) => ({
			reaction,
			count,
		}))
		reactionCounts.sort((a, b) => b.count - a.count)
		return reactionCounts
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
			if (index > -1) {
				this.setState({
					checkedPages: update(this.state.checkedPages, { $splice: [[index, 1]] }),
				})
			}
		}
	}

	private getIndices(pages: PageReactions[], checkedPageUrls: string[]): number[] {
		const result = []
		const pageUrlsSet = new Set(checkedPageUrls)
		for (let i = 0; i < pages.length; ++i) {
			if (pageUrlsSet.has(pages[i].pageUrl)) {
				result.push(i)
			}
		}
		return result
	}

	deletePages(): void {
		if (confirm(getMessage('deleteSelectedPagesConfirmation'))) {
			const { checkedPages } = this.state
			let { history, shownHistory, reactionCounts } = this.state
			// Make the loading spinner show.
			this.setState({ history: undefined, shownHistory: undefined, reactionCounts: undefined, checkedPages: [] }, async () => {
				try {
					await this.state.emojit!.deleteUserReactions(checkedPages)
					this.errorHandler.showError({ errorMsg: getMessage('deleteUserPageReactionsSuccess') })

					if (history) {
						const indices = this.getIndices(history.pages, checkedPages)
						indices.sort((a, b) => b - a)
						for (const index of indices) {
							history.pages.splice(index, 1)
						}

						reactionCounts = this.getReactionCounts(history)
					}

					if (shownHistory) {
						const indices = this.getIndices(shownHistory.pages, checkedPages)
						indices.sort((a, b) => b - a)
						for (const index of indices) {
							shownHistory.pages.splice(index, 1)
						}
					}
				} catch (serviceError) {
					this.errorHandler.showError({ serviceError })
				}

				this.setState({ history, shownHistory, reactionCounts })
			})
		}
	}

	render(): React.ReactNode {
		return <Container>
			<Typography className={classes.title} component="h4" variant="h4">
				<HistoryIcon className={classes.historyIcon} color="primary" fontSize="large" />
				{getMessage('historyPageTitle') || "History"}
			</Typography>


			{this.state.history !== undefined && this.state.history.pages.length > 0 && <div>
				<Grid container spacing={2}>
					{this.state.reactionCounts?.map(({ reaction, count }) =>
						<Grid item key={reaction} xs={6} sm={4} md={3} lg={1}>
							{/* TODO Make toggleable to search. */}
							<Card className={classes.card} raised={true}>
								<CardContent>
									<Typography className={classes.center} variant="h6">
										{reaction}
									</Typography>
									<Typography className={classes.center} color="textSecondary" component="p">
										{"x "}{count}
									</Typography>
								</CardContent>
							</Card>
						</Grid>)}
				</Grid>





				<Button className={classes.deleteButton}
					disabled={this.state.checkedPages.length === 0}
					color="secondary"
					variant="contained"
					onClick={this.deletePages}>
					{getMessage('deleteSelectedPages', this.state.checkedPages.length)}
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
			{this.state.shownHistory === undefined && this.state.errorGettingHistory !== undefined && <Typography variant="body2" component="p" color="error">
				{this.state.errorGettingHistory}
			</Typography>}
			{this.state.shownHistory === undefined && this.state.errorGettingHistory === undefined && <div className={classes.center}>
				<CircularProgress size={70} style={{ color: progressSpinnerColor }}
				/>
			</div>
			}
			{this.state.history !== undefined && this.state.history.pages.length === 0 && <div>
				<Typography variant="body2" component="p" >
					{getMessage("noHistory")}
				</Typography>
			</div>}

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
											{getMessage('currentReactionsIdentifier') || "Your current reaction(s): "}
											<span className={classes.pageReactions}>
												{page.currentReactions.join("")}
											</span>
										</Typography>
										<Typography variant="body2" component="p" color="textSecondary">
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

export default History
