export class ErrorHandler {
	constructor(errorTextElement) {
		this.errorTextElement = errorTextElement
	}

	showError({ errorMsg, clearAfterMs }) {
		clearTimeout(this.lastTimeout)
		clearAfterMs = clearAfterMs || (10 * 1000)
		this.errorTextElement.innerText = errorMsg
		this.lastTimeout = setTimeout(() => {
			if (this.errorTextElement.innerText === errorMsg) {
				this.errorTextElement.innerText = ""
			}
		}, clearAfterMs)
	}
}