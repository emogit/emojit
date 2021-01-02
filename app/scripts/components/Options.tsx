import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { isValidUserId, setupUserSettings } from '../user'
import { ErrorHandler } from '../error_handler'
import { browser } from 'webextension-polyfill-ts'
import { EmojitApi } from '../api'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import { getMessage } from '../i18n_helper'

import FormControlLabel from '@material-ui/core/FormControlLabel'

export default class Options extends React.Component<any, {
	emojit: EmojitApi | undefined,
	serviceUrl: string,
	updateIconTextWithTopPageReaction: boolean | undefined,
	userId: string,
}> {
	private errorHandler = new ErrorHandler(undefined)

	constructor(props: any) {
		super(props)
		this.state = {
			emojit: undefined,
			serviceUrl: "",
			updateIconTextWithTopPageReaction: undefined,
			userId: "",
		}

		this.handleChange = this.handleChange.bind(this)
		this.setUserId = this.setUserId.bind(this)
	}

	componentDidMount(): void {
		setupUserSettings().then((userSettings: any) => {
			const emojit = userSettings.emojit
			const userId = userSettings.userId
			const { serviceUrl, updateIconTextWithTopPageReaction } = userSettings
			this.setState({
				emojit,
				serviceUrl,
				updateIconTextWithTopPageReaction,
				userId,
			})

			// document.getElementById('service-url').value = serviceUrl
			// document.getElementById('icon-top-reaction').checked = updateIconTextWithTopPageReaction === true
		})
	}

	setUserId(): void {
		const newUserId = this.state.userId

		if (!isValidUserId(newUserId)) {
			const errorMsg = browser.i18n.getMessage('invalidUserId')
			this.errorHandler.showError({ errorMsg })
			return
		}
		const keys = { userId: newUserId }
		browser.storage.local.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
		browser.storage.sync.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
	}

	setUpdateIconText(): void {
		const keys = {
			updateIconTextWithTopPageReaction: this.state.updateIconTextWithTopPageReaction,
		}
		browser.storage.local.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
		browser.storage.sync.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
	}

	handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
		this.setState<never>({
			[event.target.name]: value,
		}, () => {
			if (event.target.name === 'updateIconTextWithTopPageReaction') {
				this.setUpdateIconText()
			}
		})
	}

	render(): React.ReactNode {
		return <Container>
			<Typography component="h1">
				Options
		 	</Typography>
			<div className="section">
				<Typography component="h2">
					{getMessage('userIdSectionTitle') || "User ID"}
				</Typography>
				<Typography component="p">
					{getMessage('userIdExplanation') || "\
					Your user ID is also your password.\
					Do not share it.\
					You can copy your user ID to another device or browser to import your account to that device or browser."}
				</Typography>
				<TextField name='userId'
					value={this.state.userId}
					onChange={this.handleChange}
					style={{ width: 320 }}
				/>
				<div className="button-holder">
					<button data-i18n="setUserId" onClick={this.setUserId}>
						Set user ID
					</button>
				</div>
			</div>

			<div className="section">
				<Typography component="h2">
					{getMessage('iconOptionsSectionTitle') || "Icon Options"}
				</Typography>
				<FormControlLabel
					control={<Checkbox name='updateIconTextWithTopPageReaction'
						checked={this.state.updateIconTextWithTopPageReaction === true}
						onChange={this.handleChange}
					/>}
					label={getMessage('updateIconTextWithTopPageReactionLabel') || "Show the top emoji for the page on top of the extension icon without clicking on the extension icon"}
				/>
				<Typography component="p">
					This may only work on tabs opened after enabling this option.
					This sends the page's URL address to a server every time you change the tab in your browser.
					This is disabled by default because it could make it look like we are trying to record your browsing history
					even though we are not.
					Currently, your user ID will not be sent with this request but this may change it the future for
					authentication purposes to prevent spam requests.
				</Typography>
			</div>

			{/* Make toggle so that data cannot be deleted by accident as easily. */}
			<div className="section">
				<h3 data-i18n="yourDataSectionTitle">Your Data</h3>
				<button data-i18n="exportMyData" id="export-data">
					Export my data
		</button>
				<button data-i18n="deleteAllUserDataButton" id="delete-all-user-data">
					Delete all my data
		</button>
			</div>

			{/* Add Advanced toggle. */}
			<div className="section">
				<h3 data-i18n="advancedSectionTitle">Advanced</h3>
				<label>
					<span data-i18n="serviceUrlLabel">Service URL:</span>
					<input type="text" id="service-url" />
				</label>
				<button data-i18n="setServiceUrl" id="set-service-url">
					Set service URL
				</button>
				<div className="button-holder">
					<button data-i18n="resetServiceUrl" id="reset-service-url">
						Reset service URL
			</button>
				</div>
			</div>
		</Container>
	}
}