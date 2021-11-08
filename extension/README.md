# Emojit Browser Extension

Rate any web page.

# Downloads
You can download the extension for various browsers:
* [Chrome/Brave/Edge](https://chrome.google.com/webstore/detail/fdaopifdchifnfaiammaknlaniecbdmo)

# Dev
To install dependencies, you will need a GitHub PAT.
You can generate one at https://github.com/settings/tokens.
Give it the `write:packages` and possibly the `repo` scopes.

## Install
```bash
EMOGIT_NPM_AUTH_TOKEN=<GitHub PAT token> yarn install
```

## Development
Run one of:

    yarn dev chrome
    yarn dev firefox
    yarn dev opera
    yarn dev edge

## Build
Run one of:

    yarn build chrome
    yarn build firefox
    yarn build opera
    yarn build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

## Docs

* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)
