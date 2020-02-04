![Build](https://github.com/NLnetLabs/lagosta/workflows/Build/badge.svg)

# Lagosta

Lagosta is the user interface for [Krill](https://github.com/NLnetLabs/krill).

The project uses [Vue.js](https://vuejs.org/) as Javascript framework and [Element](https://element.eleme.io/) as UI framework.

## Requirements
* Node.js
* Yarn (or npm)

## Project setup
To get all the required js libraries in, run
```
yarn install
```

To point to your Krill instance, edit the vue.config.js file and its host as a proxy for the API calls
```
devServer: {
  proxy: 'https://localhost:3000'
}
```

### Compiles and hot-reloads for development
Useful during development to instantaneously see the changes on screen
```
yarn run serve
```

### Compiles and minifies for production
To get everything compiled and minified in the "dist" folder
```
yarn run build
```

### Serve in production
There are two ways to run the app in production:
* Configure your webserver to proxy all the /api calls to the Krill daemon
* Use the provided 'server.js' to spin up a simple HTTP server that proxies the API calls

To use the latter, first create a .env file with the parameters that suit your environment
```
PROXY_BASE_URL=https://your-host
SERVE_FOLDER=dist
```
and then run
```
node server.js
```