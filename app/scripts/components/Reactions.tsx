import { EmojiButton } from '@joeattardi/emoji-button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import HistoryIcon from '@material-ui/icons/History'
import update from 'immutability-helper'
import React from 'react'
import { browser, Tabs } from 'webextension-polyfill-ts'
import { EmojitApi, PageReaction } from '../api'
import { ErrorHandler } from '../error_handler'
import { setupUserSettings } from '../user'
import { progressSpinnerColor } from './constants'

const MAX_NUM_EMOJIS = 5

const styles = (theme: Theme) => createStyles({
	header: {
		marginBottom: theme.spacing(1),
	},
	end: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
	},
	reactingLoader: {
		position: 'relative',
		top: '-2px',
		paddingRight: '2px',
	},
	historyButton: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		border: 'none',
		outline: 'none',
		fontSize: '1.5em',
		// Make the buttons line up.
		position: 'relative',
		top: '6px',
	},
	badgesButton: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		border: 'none',
		outline: 'none',
		fontSize: '1.5em',
	},
	optionsButton: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		border: 'none',
		outline: 'none',
		// Make sure it align with the right side.
		paddingRight: 0,
		fontSize: '1.5em',
	},
	reactionGrid: {
		flexGrow: 1,
		marginTop: theme.spacing(1.5),
		minHeight: '6em',
		fontSize: '1.5em',
	},
	reactionButton: {
		backgroundColor: 'inherit',
		fontSize: 'inherit',
		cursor: 'pointer',
		outline: 'none',
		borderRadius: '16px',
		borderColor: 'lightgrey',
		minWidth: 'max-content',
		padding: '4px',
		paddingRight: '6px',
		paddingLeft: '6px',
	},
	reactionButtonPicked: {
		backgroundColor: 'dodgerblue',
	},
	reactionCount: {
		fontSize: '1em',
		color: 'grey',
		paddingLeft: '0.5em',
	},
	reactionPickedCount: {
		color: 'floralwhite',
	},
	errorSection: {
		color: 'red',
		fontSize: '1.0em',
		wordBreak: 'break-word',
	},
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	emojiTrigger: {
		backgroundColor: 'inherit',
		cursor: 'pointer',
		outline: 'none',
		borderRadius: '16px',
		borderColor: 'lightgrey',
		padding: '4px',
		margin: '2px',
		fontSize: '2em',
	}
})

class Reactions extends React.Component<WithStyles<typeof styles>, {
	emojit: EmojitApi | undefined,
	pageUrl: string | undefined,
	userReactions: string[] | undefined,
	pageReactions: PageReaction[] | undefined,
	showReactingLoader: boolean
}> {
	private errorHandler: ErrorHandler | undefined
	private picker = new EmojiButton(
		{
			autoHide: false,
			emojiSize: '1.5em',
			emojisPerRow: 6,
			initialCategory: 'recents',
			position: 'bottom',
			recentsCount: 20,
			rows: 4,
			theme: 'auto',
		}
	)

	constructor(props: any) {
		super(props)
		this.state = {
			emojit: undefined,
			pageUrl: undefined,
			userReactions: undefined,
			pageReactions: undefined,
			showReactingLoader: false,
		}
	}

	async componentDidMount() {
		const { emojit } = await setupUserSettings()
		this.setState({ emojit })

		browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
			const pageUrl = tabs[0].url
			this.setState({ pageUrl }, () => {
				this.loadReactions(tabs[0])
			})
		})
		this.errorHandler = new ErrorHandler(document.getElementById('error-text'))
		this.setUpEmojiPicker()
	}

	setUpEmojiPicker(): void {
		// Docs https://emoji-button.js.org/docs/api/
		const trigger = document.getElementById('emoji-trigger')

		this.picker.on('emoji', selection => {
			this.addEmoji(selection.emoji)
		})

		this.picker.on('hidden', () => {
			this.condensePopup()
		})

		trigger!.addEventListener('click', () => {
			this.expandPopup()
			this.picker.togglePicker(trigger!)
		})
	}

	openBadges(): void {
		browser.tabs.create({ url: 'pages/home.html?page=badges' })
	}

	openHistory(): void {
		browser.tabs.create({ url: 'pages/home.html?page=history' })
	}

	openOptions(): void {
		browser.runtime.openOptionsPage()
	}

	condensePopup(): void {
		document.getElementById('main-popup')!.style.height = '250px'
	}

	expandPopup(): void {
		document.getElementById('main-popup')!.style.height = '450px'
	}

	async loadReactions(tab: Tabs.Tab): Promise<void> {
		console.debug("Loading reactions...")

		try {
			const { userReactions, pageReactions } = await this.state.emojit!.getUserPageReactions(this.state.pageUrl!)
			this.setState({ userReactions, pageReactions })
			if (pageReactions) {
				if (pageReactions.length > 0) {
					browser.browserAction.setBadgeText({ tabId: tab.id, text: pageReactions[0].reaction })
				} else {
					browser.browserAction.setBadgeText({ tabId: tab.id, text: null })
				}
			}
		} catch (serviceError) {
			this.errorHandler!.showError({ serviceError })
			this.setState({ userReactions: [], pageReactions: [] })
		}
	}

	hasMaxReactions(): boolean {
		return !this.state.userReactions || this.state.userReactions.length >= MAX_NUM_EMOJIS
	}

	addEmoji(reaction: string): void {
		if (this.hasMaxReactions()) {
			if (this.picker.isPickerVisible()) {
				this.picker.hidePicker()
			}
			const errorMsg = "Maximum number of emojis selected."
			this.errorHandler!.showError({ errorMsg })
			return
		}

		// Update the UI before sending the request to the service to make the UI feel quick.
		this.updatePageReactions({ reaction, count: +1 })
		this.setState({
			userReactions: update(this.state.userReactions, { $push: [reaction] }),
			showReactingLoader: true,
		}, () => {
			this.react([{ reaction, count: +1 }]).then(() => {
			}).catch((serviceError: any) => {
				this.errorHandler!.showError({ serviceError })
				// Remove the reaction.

				const index = this.state.userReactions!.indexOf(reaction)
				if (index > -1) {
					this.updatePageReactions({ reaction, count: -1 })
					this.setState({
						userReactions: update(this.state.userReactions, { $splice: [[index, 1]] }),
					})
				}
			}).finally(() => {
				this.setState({ showReactingLoader: false })
			})
		})
	}

	react(modifications: any[]): any {
		const { pageUrl } = this.state
		if (!pageUrl) {
			console.warn("pageUrl has not been set yet. Will retry.")
			setTimeout(() => { this.react(modifications) }, 200)
		}
		return this.state.emojit!.react({
			pageUrl,
			modifications,
		}).then(r => {
			this.errorHandler!.clear()
			return r
		})
	}

	clickReaction(reaction: string): void {
		const isPickedByUser = this.state.userReactions !== undefined && this.state.userReactions.indexOf(reaction) > -1
		if (isPickedByUser) {
			this.removeAllEmojiOccurrences(reaction)
		} else {
			if (this.hasMaxReactions()) {
				const errorMsg = "Maximum number of emojis selected."
				this.errorHandler!.showError({ errorMsg })
				return
			}
			this.addEmoji(reaction)
		}
	}

	removeAllEmojiOccurrences(reaction: string): void {
		const indicesToRemove = []
		while (true) {
			const fromIndex = indicesToRemove.length === 0 ? 0 : indicesToRemove[indicesToRemove.length - 1] + 1
			const index = this.state.userReactions!.indexOf(reaction, fromIndex)
			if (index > -1) {
				indicesToRemove.push(index)
			} else {
				break
			}
		}
		const countDiff = -indicesToRemove.length
		if (countDiff < 0) {
			this.updatePageReactions({ reaction, count: countDiff })
			this.setState({
				userReactions: update(this.state.userReactions, { $splice: indicesToRemove.map(i => [i, 1]) }),
				showReactingLoader: true,
			})

			this.react([{ reaction, count: countDiff }]).then(() => {
			}).catch((serviceError: any) => {
				this.errorHandler!.showError({ serviceError })
				// Add back the reactions.
				this.updatePageReactions({ reaction, count: Math.abs(countDiff) })
				this.setState({
					userReactions: update(this.state.userReactions, { $push: Array(Math.abs(countDiff)).fill(reaction) }),
					showReactingLoader: true,
				})
			}).finally(() => {
				this.setState({ showReactingLoader: false })
			})
		}
	}

	updatePageReactions(modification: PageReaction): void {
		const pageReactions = this.state.pageReactions || []
		let found = false
		pageReactions.forEach(r => {
			if (r.reaction === modification.reaction) {
				found = true
				// Even keep 0 in case they want to redo the reaction.
				r.count += modification.count
			}
		})
		if (!found && modification.count > 0) {
			pageReactions.push(modification)
		}
		// Purposely do not re-sort to avoid jumpiness.

		this.setState({ pageReactions })
	}

	render(): React.ReactNode {
		const { classes } = this.props

		// `pageReactions` already include the user's reactions.

		return <div>
			<div className={`${classes.header} ${classes.end}`}>
				{this.state.showReactingLoader && <CircularProgress className={classes.reactingLoader} size={20} thickness={5} style={{ color: progressSpinnerColor }} />}
				<button className={classes.historyButton}
					onClick={this.openHistory}>
					<HistoryIcon color="primary" />
				</button>
				<button className={classes.badgesButton}
					onClick={this.openBadges}>
					🏆
				</button>
				<button
					className={classes.optionsButton}
					onClick={this.openOptions}>
					⚙️
				</button>
			</div>
			<Grid container
				className={`${classes.reactionGrid} ${classes.center}`}
				spacing={1}
			>
				{/* Keep spinner in here so that the emoji button doesn't jump too much. */}
				{this.state.pageReactions === undefined && <div>
					<CircularProgress size={60} style={{ color: progressSpinnerColor }} />
				</div>}
				{this.state.pageReactions !== undefined && this.state.pageReactions.map(pageReaction => {
					const isPicked = this.state.userReactions && this.state.userReactions.indexOf(pageReaction.reaction) > -1
					return <Grid key={`reaction-${pageReaction.reaction}`} item xs={3}>
						<button className={`${classes.reactionButton} ${isPicked ? classes.reactionButtonPicked : ''}`} onClick={() => this.clickReaction(pageReaction.reaction)}>
							<span>
								{pageReaction.reaction}
							</span>
							<span className={`${classes.reactionCount} ${isPicked ? classes.reactionPickedCount : ''}`}>
								{pageReaction.count}
							</span>
						</button>
					</Grid>
				}
				)}
			</Grid>
			<div className={classes.errorSection}>
				<Typography component="p" id="error-text"></Typography>
			</div>
			<div className={classes.center}>
				<button
					id="emoji-trigger"
					className={classes.emojiTrigger}
					disabled={this.hasMaxReactions()}
				>
					🙂
				</button>
			</div>
		</div>
	}
}

export default withStyles(styles)(Reactions)
