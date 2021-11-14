import { fail } from 'assert'
import { expect } from 'chai'
import { EmojitError, ErrorCode } from '../../error/error'
import { createNewUserId } from '../../user'
import { EmojitApi, ReactionModification, ReactRequest } from '../client'

describe("Client", () => {
	const e = new EmojitApi(createNewUserId())

	beforeEach(async () => {
		await e.deleteUser()
	})

	after(async () => {
		await e.deleteUser()
	})

	it('react', async () => {
		let currentReactions = await e.getAllUserReactions()
		expect(currentReactions.pages).to.be.empty

		// Try with bad URL.
		try {
			await e.react(new ReactRequest('bad URL', []))
			fail("Should cause an exception.")
		} catch (err) {
			expect(err).to.be.instanceOf(EmojitError)
			expect((err as EmojitError).errorCode).to.be.equal(ErrorCode.INVALID_URL)
		}

		const reactResponse = await e.react(new ReactRequest('https://emojit.site/test',
			[
				new ReactionModification('🤓', 1),
			]))
		expect(reactResponse.reactions).to.deep.equal(['🤓'])

		await e.deleteUser()
		currentReactions = await e.getAllUserReactions()
		expect(currentReactions.pages).to.be.empty
	})
})