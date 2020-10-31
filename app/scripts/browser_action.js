import { EmojiButton } from '@joeattardi/emoji-button'
import $ from 'jquery'
import { setupUserSettings } from './user'

const MAX_NUM_EMOJIS = 5

const pickedClassName = 'reaction-button-picked'

let serviceUrl
let emojit
let userId, pageUrl

let userReactions = []

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

function updateTopReactionButton({ emoji, count, userPicked, updateCount }) {
	if (!emoji) {
		return
	}
	const reactionsDiv = document.getElementById('reactions')
	const existingSpan = $(`.reaction-button[emoji=${emoji}] span`)[0]
	if (existingSpan) {
		const button = $(`.reaction-button[emoji=${emoji}]`)[0]
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
		button.setAttribute('emoji', emoji)
		button.innerHTML = `${emoji} <span class="reaction-count">${count}</span>`
		button.onclick = clickReaction
		reactionsDiv.appendChild(button)
	}
}

function loadReactions() {
	console.debug("Loading reactions...")

	const userPageReactions = emojit.getUserPageReactions(userId, pageUrl)
	emojit.getPageReactions(pageUrl).then(response => {
		const { reactions } = response
		for (const reaction of reactions) {
			updateTopReactionButton(reaction)
		}
		userPageReactions.then(response => {
			const { reactions } = response
			if (reactions) {
				for (const emoji of reactions) {
					updateTopReactionButton({ emoji, count: 1, userPicked: true })
				}
				userReactions = reactions
				checkReactionCount()
			}
		})
	})
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
	userReactions.push(emoji)
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
	const lengthBefore = userReactions.length
	userReactions = userReactions.filter(e => e !== emoji)
	const countDiff = userReactions.length - lengthBefore
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
	return userReactions
}
