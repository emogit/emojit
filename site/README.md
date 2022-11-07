# Emojit Website
The website and a widget that you can embed into a webpage.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Development
```bash
yarn install
PORT=80 yarn start
```

## Using the Widget in an `iframe`
Example:
```html
<iframe src="http://localhost/widget" width="400px" height="500px" title="Emojit reaction picker" referrerpolicy="unsafe-url"></iframe>
```

`referrerpolicy="unsafe-url"` allows the code in the iframe to get the referring URL.
If someone has security concerns, then we can discuss other options.
There are a bunch of suggestions at https://stackoverflow.com/questions/3420004, but we shouldn't do something that passes the full URL as a URL parameter to the iframe since that's not secure because someone could easily fake it.
Maybe we could use `postMessage` and verify the origin.