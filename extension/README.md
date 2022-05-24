# Emojit Browser Extension
Emojit allows you to rate any web page 🤯

# Downloads
You can download the extension for various browsers:
* [Chrome/Brave/Edge](https://chrome.google.com/webstore/detail/fdaopifdchifnfaiammaknlaniecbdmo)
* [Firefox](https://addons.mozilla.org/addon/emojit)

Want the bleeding edge latest build?
You can install an artifact from a build [here](https://github.com/emogit/emojit/actions/workflows/build.yml?query=branch%3Amain+is%3Asuccess).
The build reports checksums in the "Extension: Build" step.

# Dev
You will need install and build the dependencies in this repo first:
```bash
# Go to the repo root:
pushd ..
yarn install
cd core
yarn install && yarn build
cd react-core
yarn install && yarn build
popd
```

Otherwise, if you just try to build from this folder, then you might need `EMOGIT_NPM_AUTH_TOKEN` to be a GitHub PAT.
You can generate one at https://github.com/settings/tokens.
Give it the `write:packages` and possibly the `repo` scopes.
```bash
EMOGIT_NPM_AUTH_TOKEN=<GitHub PAT token> yarn install
```

## Install
In this folder, run `yarn install`.

## Development
Run one of:

    yarn dev chrome
    yarn dev firefox
    yarn dev opera
    yarn dev edge

An extension that is ready to be loaded as an unpacked extension/add-on can be found in `dist/<platform>/`.

## Build
Run one of:

    yarn build chrome
    yarn build firefox
    yarn build opera
    yarn build edge

A package will get placed in the packages folder.

## Lint
```bash
yarn lint
```

Correct:
```bash
yarn lint-fix
```

## Test
```bash
yarn test
```

## Environment
The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

## Docs
* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)
