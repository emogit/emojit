# Emojit
Emojit allows you to rate any web page using emojis 🤯

This repository holds the public code for Emojit.

<!-- Following monorepo guide in https://valcker.medium.com/configuring-typescript-monorepo-with-eslint-prettier-and-webstorm-61a71f218104. -->

# Browser Extension
You can install our extension in various browsers:
* [Chrome/Brave/Edge](https://chrome.google.com/webstore/detail/fdaopifdchifnfaiammaknlaniecbdmo)
* [Firefox](https://addons.mozilla.org/addon/emojit)

Want the bleeding edge latest build?
You can install an artifact from a build [here](https://github.com/emogit/emojit/actions/workflows/build.yml?query=branch%3Amain+is%3Asuccess).
The build reports checksums in the "Extension: Build" step.

# Widget
Embed the Emojit widget in your site and let users react to the page:
```html
<iframe src="https://emojit.site" title="Emojit reaction picker"
    referrerpolicy="unsafe-url"
    width="400px" height="500px" style="border:none;">
</iframe>
```

`referrerpolicy="unsafe-url"` allows the code in the iframe to get the referring URL.
If someone has security concerns, then create an issue on GitHub and we can discuss other options.
There are a bunch of suggestions at https://stackoverflow.com/questions/3420004, but we shouldn't do something that passes the full URL as a URL parameter to the iframe since that's not secure because someone could easily fake it.
Maybe we could use `postMessage` and verify the origin.

# Code
[![Build](https://github.com/emogit/emojit/actions/workflows/build.yml/badge.svg)](https://github.com/emogit/emojit/actions/workflows/build.yml)

See the code for our [browser extension](./extension).

<!-- TODO Show gif of using the extension. -->

[Website + Embeddable Widget](./site)

[Core Code](./core) including the API client.

# API
To install our package, you will need to authenticate with GitHub Packages:\
`npm login --scope=@emogit --registry=https://npm.pkg.github.com`

See https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages for details.

Install the package:\
`npm install @emogit/emojit-core`

or

`yarn add @emogit/emojit-core`

Examples:
```TypeScript
import { createNewUserId, EmojitClient, ReactionModification, ReactRequest } from '@emogit/emojit-core'

// Create a client for a specific user.
// A userId is a v4 UUID. It should be kept secret.
const userId = createNewUserId()
const client = new EmojitClient(userId)

// Add a reaction to a page.
const url = 'https://mysite.site/page'
const reactResponse = await client.react(new ReactRequest(
    url,
    [
        new ReactionModification('💕', 1),
        new ReactionModification('🤓', 1),
    ]))
// reactResponse has the user's current reactions for the URL:
// { reactions: ['💕', '🤓'] }

// Check the reactions on a page.
const pageReactions = await client.getPageReactions(url)
// pageReactions has the reactions for all users for the URL:
// { reactions: [{ reaction: '👨‍💻', count: 3 }, { reaction: '💕', count: 2 }, { reaction: '🤓', count: 1 }, ...]}
```

See [client.ts](./core/src/api/client.ts) for full details.

# Development
Use Node 16 because Node 18 has issues with webpack 4.

Some helpful commands from the root:
* Install all subprojects: `./scripts/run-all.sh yarn install`
* Lint all: `./scripts/run-all.sh yarn lint`
* Lint `--fix` all: `./scripts/run-all.sh yarn lint-fix`
* Test all: `./scripts/run-all.sh yarn test`
