// Inspired by https://stackoverflow.com/a/56429696/1226799
document.querySelectorAll('[data-i18n]').forEach(e => {
	const text = browser.i18n.getMessage(e.dataset.i18n)
	if (text) {
		e.innerText = text
	} else {
		console.warn(`No message found for "${e.dataset.i18n}".`)
	}
})
