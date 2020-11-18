export class ErrorHandler {
	constructor(errorTextElement) {
		this.errorTextElement = errorTextElement
	}

	showError({ serviceError, errorMsg, clearAfterMs }) {
		clearTimeout(this.lastTimeout)
		if (!serviceError !== undefined) {
			const { errorCode, message } = serviceError
			errorMsg = browser.i18n.getMessage(`errorCode-${errorCode}`) || message
		}
		console.error(errorMsg)
		clearAfterMs = clearAfterMs || (10 * 1000)
		this.errorTextElement.innerText = errorMsg
		this.lastTimeout = setTimeout(() => {
			if (this.errorTextElement.innerText === errorMsg) {
				this.errorTextElement.innerText = ""
			}
		}, clearAfterMs)
	}
}