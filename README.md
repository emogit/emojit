# Emojit
Emojit allows you to rate any web page using emojis 🤯

This repository holds the public code for Emojit.

<!-- Following monorepo guide in https://valcker.medium.com/configuring-typescript-monorepo-with-eslint-prettier-and-webstorm-61a71f218104. -->

# Browser Extension
You can install our extension in various browsers:
* [Chrome/Brave/Edge](https://chrome.google.com/webstore/detail/fdaopifdchifnfaiammaknlaniecbdmo)

It should work for Firefox but we haven't built it and tried it yet.

# Code
See the code for our [browser extension](./extension).

<!-- TODO Show gif of using the extension. -->

[Website + Embeddable Widget](./site)

[Core Code](./core) including the API client.

# API
`npm install @emogit/emojit-core`

or

`yarn add @emogit/emojit-core`

Examples:
```TypeScript
import { createNewUserId, EmojitClient, ReactionModification, ReactRequest } from '@emogit/emojit-core'

// Create a client for a specific user.
// A userId is a v4 UUID. It should be kept secret.
const client = new EmojitClient(createNewUserId())

// Add a reaction to a page.
const reactResponse = await cllient.react(new ReactRequest('https://emojit.site/test',
    [
        new ReactionModification('💕', 1),
        new ReactionModification('🤓', 1),
    ]))
// reactResponse: { reactions: ['💕', '🤓'] }

// Check the reactions on a page.
const pageReactions = await e.getPageReactions('https://emojit.site/test')
// pageReactions: { reactions: [{ reaction: '💕', count: 1 }, { reaction: '🤓', count: 1 }, ...]}
```

See [client.ts](./core/src/api/client.ts) for full details.
