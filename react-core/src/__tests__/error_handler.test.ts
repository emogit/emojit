import { expect } from 'chai'
import { ErrorHandler } from '../'

describe("ErrorHandler", () => {
	it("isValidUserId", () => {
		let keySent

		const e = new ErrorHandler((key: string) => {
			return keySent = key
		})
		e.showError("test")
		expect(keySent).to.equal("test")
	})
})