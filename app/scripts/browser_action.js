import { EmojiButton } from '@joeattardi/emoji-button'
import $ from 'jquery'
import { setupUserSettings } from './user'

const MAX_NUM_EMOJIS = 5

const pickedClassName = 'reaction-button-picked'

let serviceUrl
let emojit
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
			serviceUrl = userSettings.serviceUrl
			userId = userSettings.userId

			loadReactions()
			setUpEmojiPicker()
			// startEmojiPicker()
		})
	})
}

onPageLoad()

function checkReactionCount() {
	$('#emoji-trigger')[0].disabled = getSelectedEmojis().length >= MAX_NUM_EMOJIS
}

function updateTopReactionButton({ reaction, count, userPicked, updateCount }) {
	if (!reaction) {
		return
	}
	const reactionsDiv = document.getElementById('reactions')
	const existingSpan = $(`.reaction-button[emoji=${reaction}] span`)[0]
	if (existingSpan) {
		const button = $(`.reaction-button[emoji=${reaction}]`)[0]
		if (userPicked) {
			$(button).addClass(pickedClassName)
		} else {
			$(button).removeClass(pickedClassName)
		}
		if (updateCount) {
			const newCount = parseInt(existingSpan.innerText) + count
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
		button.innerHTML = `${reaction} <span class="reaction-count">${count}</span>`
		button.onclick = clickReaction
		reactionsDiv.appendChild(button)
	}
}

async function loadReactions() {
	console.debug("Loading reactions...")

	const { userReactions, pageReactions } = await emojit.getUserPageReactions(userId, pageUrl)
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
			// TODO Notify user.
			console.warn("Maximum number of emojis selected.")
			return
		}
		// Select reaction.
		jTarget.addClass(pickedClassName)
		addEmoji(jTarget.attr('emoji'))
	}
}

function addEmoji(emoji) {
	if (getSelectedEmojis().length >= MAX_NUM_EMOJIS) {
		// TODO Notify user.
		console.warn("Maximum number of emojis selected.")
		return
	}

	// Update the UI before sending the request to the service to make the UI feel quick.
	currentUserReactions.push(emoji)
	checkReactionCount()
	updateTopReactionButton({ emoji, count: 1, userPicked: true, updateCount: true })

	react([{ reaction: emoji, count: +1 }]).then((r) => {
	}).catch(err => {
		// TODO Notify user.
		console.error("Error adding reaction", emoji, err)
		// TODO Maybe update the UI?
	})
}

function react(modifications) {
	if (!userId || !pageUrl) {
		console.error("userId or pageUrl have not been set yet. Will retry")
		setTimeout(() => { react(modifications) }, 200)
	}
	return emojit.react({
		userId,
		pageUrl,
		modifications,
	})
}

function removeAllEmojiOccurrences(emoji) {
	const lengthBefore = currentUserReactions.length
	currentUserReactions = currentUserReactions.filter(e => e !== emoji)
	const countDiff = currentUserReactions.length - lengthBefore
	updateTopReactionButton({ emoji, count: countDiff, userPicked: false, updateCount: true })
	react([{ reaction: emoji, count: countDiff }]).then(() => {
	}).catch(err => {
		// TODO Notify user.
		console.error("Error adding reaction", emoji, err)
	})
	checkReactionCount()
}

function setUpEmojiPicker() {
	// Docs https://emoji-button.js.org/docs/api/
	const picker = new EmojiButton(
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
	);
	const trigger = document.querySelector('#emoji-trigger');

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
