[![GitHub Actions Build Status](https://github.com/NLnetLabs/lagosta/workflows/Build/badge.svg)](https://github.com/NLnetLabs/lagosta/actions?query=workflow%3ABuild)

# Lagosta

Lagosta is the user interface for [Krill](https://github.com/NLnetLabs/krill).

The project uses [Vue.js](https://vuejs.org/) as Javascript framework and [Element](https://element.eleme.io/) as UI framework.

## Requirements
* Node.js
* yarn or npm

Note that yarn requires installing an extra dependency, whereas npm is included with node.js.
OTOH if you use npm you should make sure to commit `package-lock.json` to the repository.

## Project setup
To get all the required js libraries in, run

```bash
yarn install
```

or 

```bash
npm install
```

### Running a Development Server

Vue uses webpack and webpack-dev-server to run a auto-compiling, hot-reloadable development server
and Krill is no exception.

You can start the development server by issuing:

```bash
npm run serve
```

Most of the settings for the development server are specified in the file `/vue.config.js`.

You can choose the IP Address and the port to run the Krill development server on:

```json
    port: "3003",
    https: true
```

You can use the `proxy` setting for webpkack-dev-server to reroute the HTTP requests
to your local Krill instance. Edit the `/vue.config.js` file by specifying the `proxy` option.

This will forward the requests for that particular endpoint to your local Krill instance.
Note that you'll have the reroute the `/api`, `/auth` and `/stats` endpoints to Krill.

For example:

```javascript
...
  devServer: {
    // Krill proxy instance (for API calls).
    // see: https://webpack.js.org/configuration/dev-server/#devserverproxy
    proxy: {
      "/api": { target: "https://localhost:3000" },
      "/auth": { target: "https://localhost:3000" },
      "/stats": { target: "https://localhost:3000" }
    },
...
```

In this example a local Krill instance is running on `https://localhost:3000` (The default in the krill config).

You can read more about webpack-dev-server [here](https://webpack.js.org/configuration/dev-server/).

### Creating a build for deployment

To get everything compiled and minified in the `/dist` folder, you can run:

```
yarn run build
```

or 

```
npm run build
```

This will compile and minify all JS and CSS. Again, since Vue uses webpack you can modify a
lot of settings for the build process.

See the https://webpack.js.org/concepts/.

### Routing API requests in Production

There are two ways to run the app in production:
* Configure your webserver to proxy all the calls for `/api`, `/stats` and `/auth` to the Krill daemon.
* Use the provided 'server.js' to spin up a simple HTTP server that proxies the API calls (NOT RECOMMENDED).

To use the latter, first create a .env file with the parameters that suit your environment

```
PROXY_BASE_URL=https://your-host
SERVE_FOLDER=dist
```
and then run
```
node server.js
```