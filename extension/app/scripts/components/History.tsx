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

interface ReactionHistory {
	pages: PageReactions[]
}

interface State {
	/** The URLs for the pages that the user has selected (checked off). */
	checkedPageUrls: string[]

	errorGettingHistory?: string

	emojit?: EmojitClient

	/**
	 * All of the user's reaction history.
	 * For now we assume that users don't have too much history,
	 * eventually we can do pagination.
	 */
	history?: ReactionHistory

	/**
	 * A summary of all the reactions in the user's history.
	 */
	reactionCounts?: ReactionCount[]

	/**
	 * Reactions that the user has selected to filter by.
	 */
	reactionsFilter: Set<string>

	/**
	 * Text entered into the search box.
	 */
	searchText?: string

	/**
	 * The history to display.
	 * After searching, this is the filtered history.
	 */
	shownHistory?: ReactionHistory
}

class History extends React.Component<unknown, State> {
	private errorHandler = new ErrorHandler(BrowserGetMessage)

	constructor(props: any) {
		super(props)
		this.state = {
			checkedPageUrls: [],
			emojit: undefined,
			errorGettingHistory: undefined,
			history: undefined,
			reactionsFilter: new Set<string>(),
			shownHistory: undefined,
		}

		this.deletePages = this.deletePages.bind(this)
		this.handleDeleteCheckbox = this.handleDeleteCheckbox.bind(this)
	}

	componentWillMount(): void {
		document.title = (getMessage('appName') || "Emojit") + " - " + (getMessage('historyPageTitle') || "History")
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
			for (const reaction of new Set(page.currentReactions)) {
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
				checkedPageUrls: update(this.state.checkedPageUrls, { $push: [pageUrl] }),
			})
		} else {
			const index = this.state.checkedPageUrls.indexOf(pageUrl)
			if (index > -1) {
				this.setState({
					checkedPageUrls: update(this.state.checkedPageUrls, { $splice: [[index, 1]] }),
				})
			}
		}
	}

	private removeFromHistory(history: ReactionHistory, checkedPageUrls: Set<string>): void {
		for (let i = history.pages.length - 1; i >= 0; --i) {
			if (checkedPageUrls.has(history.pages[i].pageUrl)) {
				history.pages.splice(i, 1)
			}
		}
	}

	deletePages(): void {
		if (confirm(getMessage('deleteSelectedPagesConfirmation'))) {
			const { checkedPageUrls } = this.state
			let { history, reactionCounts, reactionsFilter, searchText, shownHistory } = this.state
			// Make the loading spinner show.
			this.setState({ history: undefined, shownHistory: undefined, reactionCounts: undefined, checkedPageUrls: [] }, async () => {
				try {
					await this.state.emojit!.deleteUserReactions(checkedPageUrls)

					const checkedPageUrlsSet = new Set(checkedPageUrls)
					if (history) {
						this.removeFromHistory(history, checkedPageUrlsSet)
						reactionCounts = this.getReactionCounts(history)
					}

					if (shownHistory) {
						this.removeFromHistory(shownHistory, checkedPageUrlsSet)
						if (shownHistory.pages.length === 0) {
							reactionsFilter = new Set<string>()
							searchText = undefined
							shownHistory = history
						}
					}
				} catch (serviceError) {
					this.errorHandler.showError({ serviceError })
				}

				this.setState(
					{ history, reactionCounts, reactionsFilter, searchText, shownHistory },
					() => {
						this.errorHandler.showError({ errorMsg: getMessage('deleteUserPageReactionsSuccess') })
					})
			})
		}
	}

	private onClickedReaction(reaction: string) {
		const { reactionsFilter, searchText } = this.state
		let shownHistory
		if (reactionsFilter.has(reaction)) {
			reactionsFilter.delete(reaction)
			shownHistory = this.getSearchResults(this.state.history!, searchText, reactionsFilter)
		} else {
			reactionsFilter.add(reaction)
			shownHistory = this.getSearchResults(this.state.shownHistory!, searchText, reactionsFilter)
		}

		this.setState({ reactionsFilter, shownHistory })
	}

	private hasAll(reactions: string[], reactionsFilter: Set<string>): boolean {
		const reactionsSet = new Set(reactions)
		for (const reaction of reactionsFilter) {
			if (!reactionsSet.has(reaction)) {
				return false
			}
		}
		return true
	}

	private getSearchResults(history: ReactionHistory, searchText: string | undefined, reactionsFilter: Set<string>): ReactionHistory {
		searchText = (searchText || "").toLocaleLowerCase()
		if (searchText || reactionsFilter.size > 0) {
			return {
				...history,
				pages: history.pages.filter(page => (searchText === undefined
					|| page.pageUrl.toLocaleLowerCase().indexOf(searchText) > -1)
					&& (reactionsFilter.size === 0
						|| this.hasAll(page.currentReactions, reactionsFilter))
				),
			}
		} else {
			return history
		}
	}

	render(): React.ReactNode {
		const { errorGettingHistory, history, reactionsFilter, shownHistory } = this.state

		return <Container>
			<Typography className={classes.title} component="h4" variant="h4">
				<HistoryIcon className={classes.historyIcon} color="primary" fontSize="large" />
				{getMessage('historyPageTitle') || "History"}
			</Typography>
			{shownHistory === undefined && errorGettingHistory !== undefined && <Typography variant="body2" component="p" color="error">
				{errorGettingHistory}
			</Typography>}
			{shownHistory === undefined && errorGettingHistory === undefined && <div className={`${classes.loadingSpinner} ${classes.center}`}>
				<CircularProgress size={70} style={{ color: progressSpinnerColor }}
				/>
			</div>
			}

			{history !== undefined && history.pages.length > 0 && shownHistory !== undefined && <div>
				{/* Toggleable reactions summary for searching. */}
				{/* Should look like the grid for reacting to a page. */}
				<div className={classes.reactionsSummaryGrid}>
					<Grid container
						className={classes.reactionGrid}
						direction="row"
						justifyContent="center"
						alignItems="center"
						spacing={1}
					>
						{this.state.reactionCounts?.map(rc => {
							const { reaction, count } = rc
							const isPicked = reactionsFilter.has(reaction)
							// Don't allow clicking if nothing in shownHistory has this reaction because these buttons are for filtering like an AND query.
							const disabled = !isPicked && shownHistory.pages.findIndex(page => page.currentReactions.includes(reaction)) === -1
							return (<Grid key={reaction}
								container item xs
								justifyContent="center">
								<button
									className={`${classes.reactionButton} ${isPicked ? classes.reactionButtonPicked : ''}`}
									onClick={() => this.onClickedReaction(reaction)}
									disabled={disabled}
								>
									<span>
										{reaction}
									</span>
									<span className={`${classes.reactionCount} ${isPicked ? classes.reactionPickedCount : ''}`}>
										{count}
									</span>
								</button>
							</Grid>)
						})}
					</Grid>
				</div>

				<Button className={classes.deleteButton}
					disabled={this.state.checkedPageUrls.length === 0}
					color="secondary"
					variant="contained"
					onClick={this.deletePages}>
					{getMessage('deleteSelectedPages', this.state.checkedPageUrls.length.toString())}
				</Button>

				<TextField className={classes.search}
					value={this.state.searchText || ""}
					label="Enter a URL to search"
					variant="outlined"
					onChange={(event: ChangeEvent<any>) => {
						const { history, reactionsFilter } = this.state
						const searchText = event.target.value
						const shownHistory = this.getSearchResults(history!, searchText, reactionsFilter)
						this.setState({ searchText, shownHistory })
					}}
				/>
			</div>}
			{history !== undefined && history.pages.length === 0 && <div>
				<Typography variant="body2" component="p" >
					{getMessage("noHistory")}
				</Typography>
			</div>}

			<Grid container className={classes.historyGrid} spacing={1}>
				{shownHistory !== undefined && shownHistory.pages.map((page, index) =>
					<Grid key={`page-${index}`} item xs={12}>
						<Card className={classes.card} raised={true}>
							<CardContent className={classes.cartContent}>
								<Grid container spacing={0} alignItems="center">
									<Grid item xs={1}>
										<Checkbox color="secondary"
											checked={this.state.checkedPageUrls.indexOf(page.pageUrl) > -1}
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
											{getMessage('currentReactionsIdentifier')}
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
