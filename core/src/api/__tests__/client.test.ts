import { fail } from 'assert'
import { expect } from 'chai'
import { EmojitError, ErrorCode } from '../../error/error'
import { EmojitClient, ReactionModification, ReactRequest } from '../client'

describe("Client", () => {
	const e = new EmojitClient('7e577e57-7e57-4e57-be57-7e577e577e57')

	describe("Unit Tests", () => {
		it('normalizeUrl', () => {
			expect(e.normalizeUrl('')).to.be.equal('')
			expect(e.normalizeUrl('https://emojit.site')).to.be.equal('https://emojit.site')
			expect(e.normalizeUrl('https://emojit.site/')).to.be.equal('https://emojit.site')
		})
	})

	describe("Integration", () => {

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

			const pageUrl = 'https://emojit.site/test'
			const reactResponse = await e.react(new ReactRequest(pageUrl,
				[
					new ReactionModification('🤓', 1),
				]))
			expect(reactResponse.reactions).to.deep.equal(['🤓'])

			const pageReactions = await e.getPageReactions(pageUrl)
			expect(pageReactions.reactions.map(r => r.reaction)).contains('🤓')

			await e.deleteUser()
			currentReactions = await e.getAllUserReactions()
			expect(currentReactions.pages).to.be.empty
		})
	})
})