import EmojitApi from './api'

// From https://stackoverflow.com/a/2117523/1226799
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

export function setupUserSettings() {
    const defaultServiceUrl = 'https://api.emojit.site'

    const keys = {
        serviceUrl: defaultServiceUrl,
        userId: undefined,
    }

    return browser.storage.local.get(keys).then(async (results) => {
        const { serviceUrl } = results
        let { userId } = results
        const emojit = new EmojitApi(serviceUrl)

        if (!userId) {
            await browser.storage.sync.get(['userId']).then(async (results) => {
                userId = results.userId
                if (!userId) {
                    userId = uuidv4()
                    browser.storage.local.set({ userId })
                    browser.storage.sync.set({ userId })
                }
            })
        }
        return { emojit, serviceUrl, userId, }
    })
}
