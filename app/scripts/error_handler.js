export class ErrorHandler {
	/**
	 * @param {HTMLElement | undefined} errorTextElement The location where to display the error. If not given, the error will be alerted.
	 */
	constructor(errorTextElement) {
		this.errorTextElement = errorTextElement
	}

	showError({ serviceError, errorMsg, clearAfterMs }) {
		if (typeof serviceError === 'string' && !errorMsg) {
			errorMsg = serviceError
		} else if (serviceError !== undefined) {
			const { errorCode, message } = serviceError
			errorMsg = browser.i18n.getMessage(`errorCode-${errorCode}`) || message
		}
		console.error(errorMsg)
		if (this.errorTextElement) {
			clearAfterMs = clearAfterMs || (10 * 1000)
			clearTimeout(this.lastTimeout)
			this.errorTextElement.innerText = errorMsg
			this.lastTimeout = setTimeout(() => {
				if (this.errorTextElement.innerText === errorMsg) {
					this.errorTextElement.innerText = ""
				}
			}, clearAfterMs)
		} else {
			alert(errorMsg)
		}
	}
}