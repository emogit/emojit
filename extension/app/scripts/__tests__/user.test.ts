import { createNewUserId, isValidUserId } from '@emogit/emojit-core'
import { expect } from 'chai'

// Test that the library works since I'm new to importing from my own library.
// Also these are currently the only tests in this project.

describe('user', () => {
	it('isValidUserId', () => {
		expect(isValidUserId("4f584389-9ab3-47c6-9e46-899a5f95b27d")).to.be.true
		expect(isValidUserId(createNewUserId())).to.be.true
	})
})