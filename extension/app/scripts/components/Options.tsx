import { DEFAULT_SERVICE_URL, EmojitClient, isValidUserId } from '@emogit/emojit-core'
import { ErrorHandler, ThemePreferenceType } from '@emogit/emojit-react-core'
import { PaletteMode } from '@mui/material'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React from 'react'
import browser from 'webextension-polyfill'
import { BrowserGetMessage, getMessage } from '../i18n_helper'
import classes from '../styles/Options.module.css'
import { setupUserSettings } from '../user'

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

class Options extends React.Component<unknown, {
	emojit?: EmojitClient,
	updateIconTextWithTopPageReaction?: boolean,
	userId: string,
	themePreference: ThemePreferenceType | '',
	serviceUrl: string,
}> {
	private errorHandler = new ErrorHandler(BrowserGetMessage)

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
		setupUserSettings(['emojit', 'userId', 'serviceUrl', 'updateIconTextWithTopPageReaction', 'themePreference']).then((userSettings) => {
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
		const doDeleteUser = confirm(browser.i18n.getMessage('deleteAllUserDataConfirmation'))
		if (doDeleteUser) {
			this.state.emojit!.deleteUser()
				.then((_response: any) => {
					this.errorHandler.showError({ errorMsg: getMessage('deleteDataSuccess') })
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
		const themePreference = event.target.value as PaletteMode | 'device'
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
					style={{ width: 330 }}
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
					label={getMessage('updateIconTextWithTopPageReactionLabel') || ""}
				/>
				<Typography component="p">
					{getMessage('updateIconTextWithTopPageReactionInfo')}
				</Typography>
			</div>

			{/* TODO Make toggle so that data cannot be deleted by accident as easily. */}
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
					<RadioGroup aria-label="theme" name="theme" value={this.state.themePreference} onChange={this.handleThemeChange}>
						<FormControlLabel value="light" control={<Radio />} label="Light" />
						<FormControlLabel value="dark" control={<Radio />} label="Dark" />
						<FormControlLabel value="device" control={<Radio />} label="Device Preference" />
					</RadioGroup>
				</FormControl>
			</div>

			{/* TODO Add Advanced toggle. */}
			<div className={classes.section}>
				<Typography component="h5" variant="h5">
					{getMessage('advancedSectionTitle') || "Advanced"}
				</Typography>
				<Typography component="p">
					{getMessage('serviceUrlLabel') || "Service URL"}
				</Typography>
				<TextField name='serviceUrl'
					variant="outlined"
					aria-label={getMessage('serviceUrlLabel') || "Service URL"}
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

export default Options
