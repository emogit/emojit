// Inspired by https://stackoverflow.com/a/56429696/1226799
document.querySelectorAll('[data-i18n]').forEach(e => {
	e.innerText = browser.i18n.getMessage(e.dataset.i18n)
})
