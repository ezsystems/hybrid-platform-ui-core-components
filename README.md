# hybrid-platform-ui-core-components

[![Build Status](https://travis-ci.org/ezsystems/hybrid-platform-ui-core-components.svg?branch=master)](https://travis-ci.org/ezsystems/hybrid-platform-ui-core-components)

Provides the following custom elements used in the Hybrid Platform UI:

* `<ez-platform-ui-app>`
* `<ez-navigation-hub>`
* `<ez-toolbar>`

## Developers tasks

**System requirements:**
* Node >= 6.x ([nvm](https://github.com/creationix/nvm)
is an easy way to get it running)
* `bower` should be installed globally with `npm install -g bower`
* before any of the following tasks, make sure the bower and npm dependencies are
  installed and up to date by running
  ```bash
  $ npm install
  $ bower install
  ```

### Run unit tests

#### Using local browsers

```bash
$ npm run test-local
```

This will executes unit tests in local browsers.

#### Using SauceLabs

First, create an account at https://saucelabs.com/ (It's free for Open Source
projects).
Then run the following commands:

```bash
$ export SAUCE_USERNAME="your_sauce_labs_username"
$ export SAUCE_ACCESS_KEY="your_sauce_labs_key"
$ npm run test-sauce
```

The unit tests should be run using the Sauce Labs infrastructure. Targeted
platforms/browsers are defined in `wct.conf.json`.

### Run code style checks

```bash
$ npm run lint
```
