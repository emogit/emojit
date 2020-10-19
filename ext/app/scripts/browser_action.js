import { EmojiButton } from '@joeattardi/emoji-button'
import $ from 'jquery'

const MAX_NUM_EMOJIS = 5

// TODO Get from options/config.
const serviceUrl = 'https://api.emojit.site'
const pickedClassName = 'reaction-button-picked'

let userId
let pageUrl

let userReactions = []

// From https://stackoverflow.com/a/2117523/1226799
function uuidv4() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}

function onPageLoad() {
	browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
		pageUrl = tabs[0].url
		setupUserSettings().then(() => {
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

function setupUserSettings() {
	return browser.storage.local.get(['userId']).then(function (results) {
		userId = results.userId
		if (!userId) {
			browser.storage.sync.get(['userId']).then(function (results) {
				userId = results.userId
				if (!userId) {
					userId = uuidv4()
					browser.storage.local.set({ userId })
					browser.storage.sync.set({ userId })
				}
			})
		}
	})
}

// TODO Make sure max num emojis is respected.

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

	$.ajax({
		method: 'GET',
		url: `${serviceUrl}/pageReactions?pageUrl=${encodeURIComponent(pageUrl)}`,
		success: function (response) {
			console.debug("Page reactions response:", response)
			const { reactions } = response
			for (const reaction of reactions) {
				updateTopReactionButton(reaction)
			}
			loadUserReactions()
		},
		error: function (error) {
			console.error("Error getting page reactions.", error.status, error.responseJSON)
		}
	})
}

function loadUserReactions() {
	$.ajax({
		method: 'GET',
		url: `${serviceUrl}/userPageReaction?userId=${encodeURIComponent(userId)}&pageUrl=${encodeURIComponent(pageUrl)}`,
		success: function (response) {
			console.debug("User reactions:", response)
			const { reactions } = response
			if (reactions) {
				for (const emoji of reactions) {
					updateTopReactionButton({ emoji, count: 1, userPicked: true })
				}
				userReactions = reactions
				checkReactionCount()
			}
		},
		error: function (error) {
			console.error("Error getting user reactions.", error.status, error.responseJSON)
		}
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
			// TODO Indicate error.
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
		// TODO Indicate error.
		console.warn("Maximum number of emojis selected.")
		return
	}
	userReactions.push(emoji)
	updateTopReactionButton({ emoji, count: 1, userPicked: true, updateCount: true })
	react()
	checkReactionCount()
}

function react() {
	if (!userId || !pageUrl) {
		console.error("userId or pageUrl have not been set yet. Will retry")
		setTimeout(() => { react() }, 200)
	}
	return $.ajax({
		method: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		url: `${serviceUrl}/react`,
		data: JSON.stringify({
			userId,
			pageUrl,
			reactions: userReactions,
		}),
		success: function (response) {
			console.debug("React response:", response)
			return response
		},
		error: function (error) {
			console.error("Error reacting.", error.status, error.responseJSON)
		}
	})
}

function removeAllEmojiOccurrences(emoji) {
	const lengthBefore = userReactions.length
	userReactions = userReactions.filter(e => e !== emoji)
	const countDiff = userReactions.length - lengthBefore
	updateTopReactionButton({ emoji, count: countDiff, userPicked: false, updateCount: true })
	react()
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
