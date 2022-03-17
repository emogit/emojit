import { EmojitClient, GetMessage, PageReaction, ReactRequest } from '@emogit/emojit-core'
import { EmojiButton } from '@joeattardi/emoji-button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import update from 'immutability-helper'
import React from 'react'
import { ErrorHandler } from '../error_handler'
import classes from '../styles/Reactions.module.css'
import { ThemePreferenceType } from '../theme'
import { progressSpinnerColor } from './constants'
import { EmojitTheme } from './EmojitTheme'

const MAX_NUM_EMOJIS = 5

interface Props {
	emojitClient: EmojitClient
	pageUrl: string
	themePreference: ThemePreferenceType

	getMessage: GetMessage

	/**
	 * Runs when the current reactions for the page are updated.
	 */
	onPageReactions?: (reactions?: PageReaction[]) => void
}

/**
 * Displays the reactions for a given page and lets the user pick reactions.
 */
class Reactions extends React.Component<Props, {
	userReactions?: string[]
	pageReactions?: PageReaction[]
	showReactingLoader: boolean
}> {
	private errorHandler: ErrorHandler | undefined
	private picker: EmojiButton | undefined

	constructor(props: Props) {
		super(props)
		this.state = {
			userReactions: undefined,
			pageReactions: undefined,
			showReactingLoader: false,
		}
	}

	async componentDidMount() {
		this.errorHandler = new ErrorHandler(this.props.getMessage, document.getElementById('error-text'))
		this.loadReactions()
		this.setUpEmojiPicker(this.props.themePreference)
	}

	setUpEmojiPicker(themePreference: ThemePreferenceType): void {
		// Docs https://emoji-button.js.org/docs/api/
		const trigger = document.getElementById('emoji-trigger')

		this.picker = new EmojiButton(
			{
				// Hide so that you can see that picking one worked.
				autoHide: true,
				emojiSize: '1.5em',
				emojisPerRow: 6,
				initialCategory: 'recents',
				position: 'bottom',
				recentsCount: 20,
				rows: 4,
				theme: themePreference === 'device' ? 'auto' : themePreference,
			}
		)

		this.picker.on('emoji', selection => {
			this.addEmoji(selection.emoji)
		})

		this.picker!.on('hidden', () => {
			this.condensePopup()
		})

		trigger!.addEventListener('click', () => {
			this.expandPopup()
			this.picker!.togglePicker(trigger!)
		})
	}

	/**
	 * Condense the size of the popup for the extension.
	 * TODO Move to the extension code.
	 */
	condensePopup(): void {
		// TODO Get original size in componentDidMount.
		document.getElementById('main-popup')!.style.height = '320px'
	}

	/**
	 * Increase the size of the popup for the extension.
	 * TODO Move to the extension code.
	 */
	expandPopup(): void {
		// TODO Add to current size if less than a certain amount.
		document.getElementById('main-popup')!.style.height = '500px'
	}

	async loadReactions(): Promise<void> {
		console.debug("Loading reactions...")

		try {
			const { userReactions, pageReactions } = await this.props.emojitClient.getUserPageReactions(this.props.pageUrl)
			this.setState({ userReactions, pageReactions }, () => {
				if (this.props.onPageReactions) {
					this.props.onPageReactions(pageReactions)
				}
			})
		} catch (serviceError) {
			this.errorHandler!.showError({ serviceError })
			this.setState({ userReactions: [], pageReactions: [] })
		}
	}

	hasMaxReactions(): boolean {
		return !this.state.userReactions || this.state.userReactions.length >= MAX_NUM_EMOJIS
	}

	addEmoji(reaction: string): void {
		if (this.hasMaxReactions() && this.picker) {
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
			this.react([{ reaction, count: +1 }]).catch((serviceError: any) => {
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

	react(modifications: PageReaction[]): any {
		const { pageUrl } = this.props
		if (!pageUrl) {
			console.warn("pageUrl has not been set yet. Will retry.")
			setTimeout(() => { this.react(modifications) }, 200)
			return
		}
		return this.props.emojitClient.react(new ReactRequest(pageUrl, modifications))
			.then(r => {
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
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const fromIndex = indicesToRemove.length === 0 ? 0 : indicesToRemove[indicesToRemove.length - 1] + 1
			const index = this.state.userReactions!.indexOf(reaction, fromIndex)
			if (index > -1) {
				indicesToRemove.push(index)
			} else {
				break
			}
		}
		if (indicesToRemove.length > 0) {
			const countDiff = -indicesToRemove.length
			this.updatePageReactions({ reaction, count: countDiff })
			this.setState({
				userReactions: update(this.state.userReactions, { $splice: indicesToRemove.reverse().map(i => [i, 1]) }),
				showReactingLoader: true,
			})

			this.react([{ reaction, count: countDiff }]).catch((serviceError: any) => {
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

		this.setState({ pageReactions }, () => {
			if (this.props.onPageReactions) {
				this.props.onPageReactions(this.state.pageReactions)
			}
		})
	}

	render(): React.ReactNode {
		// `this.state.pageReactions` already includes the user's reactions.

		return (<>
			<EmojitTheme themePreference={this.props.themePreference}>
				<div className={classes.reactingLoader}>
					{this.state.showReactingLoader && <CircularProgress size={20} thickness={5} style={{ color: progressSpinnerColor }} />}
				</div>
				<div className={classes.gridDiv}>
					<Grid container
						className={classes.reactionGrid}
						direction="row"
						justifyContent="center"
						alignItems="center"
						spacing={1}
					>
						{/* Keep spinner in here so that the emoji button doesn't jump too much. */}
						{this.state.pageReactions === undefined && <div>
							<CircularProgress size={60} style={{ color: progressSpinnerColor }} />
						</div>}
						{this.state.pageReactions !== undefined && this.state.pageReactions.map(pageReaction => {
							const isPicked = this.state.userReactions && this.state.userReactions.indexOf(pageReaction.reaction) > -1
							return <Grid key={`reaction-${pageReaction.reaction}`}
								container item xs
								justifyContent="center">
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
				</div>
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
			</EmojitTheme>
		</>)
	}
}

export const ReactionsComponent = Reactions
