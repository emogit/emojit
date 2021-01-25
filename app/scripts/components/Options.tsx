import { PaletteType } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Container from '@material-ui/core/Container'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { browser } from 'webextension-polyfill-ts'
import { DEFAULT_SERVICE_URL, EmojitApi } from '../api'
import { ErrorHandler } from '../error_handler'
import { getMessage } from '../i18n_helper'
import { isValidUserId, setupUserSettings } from '../user'

// Modified from https://stackoverflow.com/a/18197341/1226799
function download(filename: string, text: string) {
	const element = document.createElement('a')
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', filename)

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()

	document.body.removeChild(element)
}

const styles = (theme: Theme) => createStyles({
	title: {
		marginBottom: theme.spacing(1),
	},
	section: {
		marginBottom: theme.spacing(2),
	},
	buttonHolder: {
		paddingTop: '4px',
	},
	themeSelection: {
		marginLeft: theme.spacing(2),
	},
})

class Options extends React.Component<WithStyles<typeof styles>, {
	emojit: EmojitApi | undefined,
	updateIconTextWithTopPageReaction: boolean | undefined,
	userId: string,
	themePreference: PaletteType | 'device' | '',
	serviceUrl: string,
}> {
	private errorHandler = new ErrorHandler(undefined)

	constructor(props: any) {
		super(props)
		this.state = {
			emojit: undefined,
			updateIconTextWithTopPageReaction: undefined,
			userId: "",
			themePreference: '',
			serviceUrl: "",
		}

		this.deleteAllUserData = this.deleteAllUserData.bind(this)
		this.exportData = this.exportData.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.handleThemeChange = this.handleThemeChange.bind(this)
		this.resetServiceUrl = this.resetServiceUrl.bind(this)
		this.setServiceUrl = this.setServiceUrl.bind(this)
		this.setUserId = this.setUserId.bind(this)
	}

	componentDidMount(): void {
		setupUserSettings().then((userSettings: any) => {
			const emojit = userSettings.emojit
			const userId = userSettings.userId
			const { serviceUrl, updateIconTextWithTopPageReaction, themePreference } = userSettings
			this.setState({
				emojit,
				serviceUrl,
				updateIconTextWithTopPageReaction,
				userId,
				themePreference,
			})
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

	exportData(): void {
		this.state.emojit!.getAllData().then((response: any) => {
			download('my_emojit_data.json', JSON.stringify(response))
		}).catch((serviceError: any) => {
			this.errorHandler.showError({ serviceError })
		})
	}

	deleteAllUserData(): void {
		const doDeleteUser = browser.extension.getBackgroundPage().confirm(browser.i18n.getMessage('deleteAllUserDataConfirmation'))
		if (doDeleteUser) {
			this.state.emojit!.deleteUser()
				.then((_response: any) => {
					const errorMsg = "Successfully deleted all of your data."
					this.errorHandler.showError({ errorMsg })
				}).catch((serviceError: any) => {
					this.errorHandler.showError({ serviceError })
				})
		}
	}

	setServiceUrl(): void {
		const { serviceUrl } = this.state
		const keys = { serviceUrl, }
		browser.storage.local.set(keys)
			.catch(errorMsg => {
				this.errorHandler.showError({ errorMsg })
			})
		browser.storage.sync.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
	}

	resetServiceUrl(): void {
		this.setState({ serviceUrl: DEFAULT_SERVICE_URL },
			this.setServiceUrl)
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

	handleThemeChange(event: React.ChangeEvent<HTMLInputElement>) {
		const themePreference = event.target.value as PaletteType | 'device'
		console.debug("themePreference:", themePreference)
		this.setState({
			themePreference,
		})
		const keys = {
			themePreference,
		}
		browser.storage.local.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
		browser.storage.sync.set(keys).catch(errorMsg => {
			this.errorHandler.showError({ errorMsg })
		})
	}

	render(): React.ReactNode {
		const { classes } = this.props

		return <Container>
			<Typography className={classes.title} component="h4" variant="h4">
				{getMessage('optionsPageTitle') || "⚙️ Options"}
			</Typography>
			<div className={classes.section}>
				<Typography component="h5" variant="h5">
					{getMessage('userIdSectionTitle') || "User ID"}
				</Typography>
				<Typography component="p">
					{getMessage('userIdExplanation') || "\
					Your user ID is also your password.\
					Do not share it.\
					You can copy your user ID to another device or browser to import your account to that device or browser."}
				</Typography>
				<TextField name='userId'
					variant="outlined"
					value={this.state.userId}
					onChange={this.handleChange}
					style={{ width: 320 }}
				/>
				<div className={classes.buttonHolder}>
					<Button variant="contained" onClick={this.setUserId}>
						{getMessage('setUserId') || "Set user ID"}
					</Button>
				</div>
			</div>

			<div className={classes.section}>
				<Typography component="h5" variant="h5">
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
			<div className={classes.section} >
				<Typography component="h5" variant="h5">
					{getMessage('yourDataSectionTitle') || "Your Data"}
				</Typography>
				<Button variant="contained" onClick={this.exportData}
					style={{ marginRight: 5 }}>
					{getMessage('downloadYourDataButton') || "Download all"}
				</Button>
				<Button variant="contained" onClick={this.deleteAllUserData}>
					{getMessage('deleteAllUserDataButton') || "Delete all"}
				</Button>
			</div >

			<div className={classes.section}>
				<Typography component="h5" variant="h5">
					{getMessage('themeSectionTitle') || "Theme"}
				</Typography>
				<Typography component="p">
					{getMessage('themePreferenceDescription')}
				</Typography>
				<FormControl className={classes.themeSelection} component="fieldset">
					{/* <FormLabel component="legend">Gender</FormLabel> */}
					<RadioGroup aria-label="theme" name="theme" value={this.state.themePreference} onChange={this.handleThemeChange}>
						<FormControlLabel value="light" control={<Radio />} label="Light" />
						<FormControlLabel value="dark" control={<Radio />} label="Dark" />
						<FormControlLabel value="device" control={<Radio />} label="Device Preference" />
					</RadioGroup>
				</FormControl>
			</div>

			{/* Add Advanced toggle. */}
			<div className={classes.section}>
				<Typography component="h5" variant="h5">
					{getMessage('advancedSectionTitle') || "Advanced"}
				</Typography>
				<TextField name='serviceUrl'
					variant="outlined"
					label={getMessage('serviceUrlLabel') || "Service URL"}
					value={this.state.serviceUrl}
					onChange={this.handleChange}
					style={{ width: 320, marginTop: '6px' }}
				/>
				<div className={classes.buttonHolder}>
					<Button variant="contained" onClick={this.setServiceUrl}
						style={{ marginRight: 5 }}>
						{getMessage('setServiceUrl') || "Set service URL"}
					</Button>
					<Button variant="contained" onClick={this.resetServiceUrl}>
						{getMessage('resetServiceUrl') || "Reset service URL"}
					</Button>
				</div>
			</div >
		</Container >
	}
}

export default withStyles(styles)(Options)
