export class ErrorHandler {
	/**
	 * @param {HTMLElement | undefined} errorTextElement The location where to display the error. If not given, the error will be alerted.
	 */
	constructor(errorTextElement) {
		this.errorTextElement = errorTextElement
	}

	showError({ serviceError = undefined, errorMsg = undefined, clearAfterMs = undefined }) {
		if (typeof serviceError === 'string' && !errorMsg) {
			errorMsg = serviceError
		} else if (serviceError && serviceError.responseJSON && serviceError.responseJSON.error) {
			const { errorCode, message } = serviceError.responseJSON.error
			errorMsg = browser.i18n.getMessage(`errorCode_${errorCode}`) || message
		}
		console.error(errorMsg)
		if (this.errorTextElement) {
			clearAfterMs = clearAfterMs || (10 * 1000)
			clearTimeout(this.lastTimeout)
			this.errorTextElement.innerText = errorMsg
			this.lastTimeout = setTimeout(() => {
				if (this.errorTextElement.innerText === errorMsg) {
					this.clear()
				}
			}, clearAfterMs)
		} else {
			alert(errorMsg)
		}
	}

	clear() {
		if (this.errorTextElement) {
			this.errorTextElement.innerText = ""
		}
	}
}