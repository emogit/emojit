import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { isValidUserId, setupUserSettings } from '../user'
import { ErrorHandler } from '../error_handler'
import { browser } from 'webextension-polyfill-ts'

export default class Options extends React.Component<any, {
}> {
	private errorHandler = new ErrorHandler(undefined)
	private userIdRef: React.RefObject<HTMLInputElement>
	constructor(props: any) {
		super(props)
		this.state = {
		}

		this.userIdRef = React.createRef()

		this.setUserId = this.setUserId.bind(this)
	}

	setUserId() {
		const newUserId = this.userIdRef.current!.value

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

	render(): React.ReactNode {
		return <Container>
			<Typography component="h5">
				Options
		 	</Typography>
			<div className="section">
				<h3 data-i18n="userIdSectionTitle">User ID</h3>
				<p data-i18n="userIdExplanation">
					Your user ID is also your password.
					Do not share it.
					You can copy your user ID to another device or browser to import your account to that device or browser.
				</p>
				<label>
					<span data-i18n="userIdLabel">User ID:</span>
					<input ref={this.userIdRef} type="text" size={40} />
				</label>
				<div className="button-holder">
					<button data-i18n="setUserId" onClick={this.setUserId}>
						Set user ID
					</button>
				</div>
			</div>

			<div className="section">
				<h3>Icon Options</h3>
				<label>
					<input type="checkbox" id="icon-top-reaction" />
					<b>Show the top emoji for the page on top of the extension icon without clicking on the extension icon</b>
				</label>
				<p>
					This may only work on tabs opened after enabling this option.
					This sends the page's URL address to a server every time you change the tab in your browser.
					This is disabled by default because it could make it look like we are trying to record your browsing history
					even though we are not.
					Currently, your user ID will not be sent with this request but this may change it the future for
					authentication purposes to prevent spam requests.
		</p>
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