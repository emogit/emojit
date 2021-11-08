import { expect } from 'chai'
import { createNewUserId, isValidUserId } from '../'

describe('user', () => {
	it('isValidUserId', () => {
		expect(isValidUserId("4f584389-9ab3-47c6-9e46-899a5f95b27d")).to.be.true
		expect(isValidUserId(createNewUserId())).to.be.true
	})
})