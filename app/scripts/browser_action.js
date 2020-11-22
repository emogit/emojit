import { EmojiButton } from '@joeattardi/emoji-button'
import $ from 'jquery'
import { ErrorHandler } from './error_handler'
import { setupUserSettings } from './user'

const MAX_NUM_EMOJIS = 5

const pickedClassName = 'reaction-button-picked'

const errorHandler = new ErrorHandler(document.getElementById('error-text'))

let emojit, picker
let userId, pageUrl

let currentUserReactions = []

function openOptions() {
	browser.runtime.openOptionsPage()
}

function onPageLoad() {
	$('#options-button')[0].onclick = openOptions
	browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
		pageUrl = tabs[0].url
		setupUserSettings().then((userSettings) => {
			emojit = userSettings.emojit
			userId = userSettings.userId

			loadReactions()
			// startEmojiPicker()
		})
	})
	setUpEmojiPicker()
}

onPageLoad()

function checkReactionCount() {
	$('#emoji-trigger')[0].disabled = getSelectedEmojis().length >= MAX_NUM_EMOJIS
}

function updateTopReactionButton({ reaction, count, userPicked, updateCount }) {
	if (!reaction) {
		return
	}
	const existingSpan = $(`.reaction-button[emoji="${reaction}"] span`)[1]
	if (existingSpan) {
		const button = $(`.reaction-button[emoji="${reaction}"]`)[0]
		if (userPicked) {
			$(button).addClass(pickedClassName)
		} else {
			$(button).removeClass(pickedClassName)
		}
		if (updateCount) {

			const newCount = parseInt(existingSpan.innerText, 10) + count
			if (newCount > 0) {
				existingSpan.innerText = newCount
			} else {
				button.remove()
			}
		}
	} else {
		const button = document.createElement('button')
		button.className = 'reaction-button'
		if (userPicked) {
			button.className += ` ${pickedClassName}`
		}
		button.setAttribute('emoji', reaction)
		const reactionElement = document.createElement('span')
		reactionElement.textContent = reaction
		const countElement = document.createElement('span')
		countElement.className = 'reaction-count'
		countElement.textContent = count
		button.appendChild(reactionElement)
		button.appendChild(countElement)
		button.onclick = clickReaction
		const reactionsDiv = document.getElementById('reactions')
		reactionsDiv.appendChild(button)
	}
}

async function loadReactions() {
	console.debug("Loading reactions...")

	let userReactions, pageReactions
	try {
		const response = await emojit.getUserPageReactions(userId, pageUrl)
		userReactions = response.userReactions
		pageReactions = response.pageReactions
	} catch (serviceError) {
		errorHandler.showError({ serviceError })
	}
	hideLoader()
	for (const reaction of pageReactions) {
		updateTopReactionButton(reaction)
	}
	if (userReactions) {
		for (const reaction of userReactions) {
			updateTopReactionButton({ reaction, count: 1, userPicked: true })
		}
		currentUserReactions = userReactions
		checkReactionCount()
	}
}

function clickReaction(event) {
	const { target } = event
	// Get the button element.
	let jTarget = $(target)
	while (!jTarget.is('.reaction-button')) {
		jTarget = jTarget.parent()
	}
	if (jTarget.hasClass(pickedClassName)) {
		// Deselect reaction.
		jTarget.removeClass(pickedClassName)
		// Remove from picked emojis.
		removeAllEmojiOccurrences(jTarget.attr('emoji'))
	} else {
		// Validate
		if (getSelectedEmojis().length >= MAX_NUM_EMOJIS) {
			const errorMsg = "Maximum number of emojis selected."
			errorHandler.showError({ errorMsg })
			return
		}
		// Select reaction.
		jTarget.addClass(pickedClassName)
		addEmoji(jTarget.attr('emoji'))
	}
}

function addEmoji(reaction) {
	if (getSelectedEmojis().length >= MAX_NUM_EMOJIS) {
		if (picker.isPickerVisible()) {
			picker.hidePicker()
		}
		const errorMsg = "Maximum number of emojis selected."
		errorHandler.showError({ errorMsg })
		return
	}

	// Update the UI before sending the request to the service to make the UI feel quick.
	currentUserReactions.push(reaction)
	checkReactionCount()
	updateTopReactionButton({ reaction, count: 1, userPicked: true, updateCount: true })

	showReactingLoader()
	react([{ reaction, count: +1 }]).then(() => {
	}).catch(serviceError => {
		errorHandler.showError({ serviceError })
		// Remove the reaction.
		updateTopReactionButton({ reaction, count: -1, userPicked: true, updateCount: true })
	}).always(() => {
		hideReactingLoader()
	})
}

function react(modifications) {
	if (!userId || !pageUrl) {
		console.warn("userId or pageUrl have not been set yet. Will retry")
		setTimeout(() => { react(modifications) }, 200)
	}
	return emojit.react({
		userId,
		pageUrl,
		modifications,
	})
}

function removeAllEmojiOccurrences(reaction) {
	const lengthBefore = currentUserReactions.length
	currentUserReactions = currentUserReactions.filter(e => e !== reaction)
	const countDiff = currentUserReactions.length - lengthBefore
	updateTopReactionButton({ reaction, count: countDiff, userPicked: false, updateCount: true })
	showReactingLoader()
	react([{ reaction, count: countDiff }]).then(() => {
	}).catch(serviceError => {
		errorHandler.showError({ serviceError })
		// Add back the reactions.
		updateTopReactionButton({ reaction, count: Math.abs(countDiff), userPicked: true, updateCount: true })
	}).always(() => {
		hideReactingLoader()
	})
	checkReactionCount()
}

function setUpEmojiPicker() {
	// Docs https://emoji-button.js.org/docs/api/
	picker = new EmojiButton(
		{
			autoHide: false,
			emojiSize: '1.5em',
			emojisPerRow: 6,
			initialCategory: 'recents',
			position: 'bottom',
			recentsCount: 20,
			rows: 4,
			theme: 'auto',
		}
	)
	const trigger = document.getElementById('emoji-trigger')

	picker.on('emoji', selection => {
		addEmoji(selection.emoji)
	})

	trigger.addEventListener('click', () => picker.togglePicker(trigger))
}

function startEmojiPicker() {
	document.getElementById('emoji-trigger').click()
}

function getSelectedEmojis() {
	return currentUserReactions
}

function hideLoader() {
	document.getElementById('reactions-loader').style.display = 'none'
}

function showReactingLoader() {
	document.getElementById('reacting-loader').style.display = ''
}

function hideReactingLoader() {
	document.getElementById('reacting-loader').style.display = 'none'
}