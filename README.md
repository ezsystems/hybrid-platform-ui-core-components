# hybrid-platform-ui-core-components

[![Build Status](https://travis-ci.org/ezsystems/hybrid-platform-ui-core-components.svg?branch=master)](https://travis-ci.org/ezsystems/hybrid-platform-ui-core-components)

Provides the following custom elements used in the Hybrid Platform UI:

* `<ez-platform-ui-app>`
* `<ez-navigation-hub>`
* `<ez-toolbar>`

In addition, this package provides a class expression mixin to add support for
tabs based on a specific markup. To use that expression mixin, you can write
something like:

```html
<link rel="import" href="path/to/polymer/polymer-element.html">
<link rel="import" href="path/to/hybrid-platform-ui-core-components/mixins/ez-tabs.html">

<script>
    class MyComponent extends eZ.TabsMixin(Polymer.Element) {
        static get is() {
            return 'my-component';
        }
        // your code
    }

    window.customElements.define(MyComponent.is, MyComponent);
</script>
```

With that, the tabs markup will be automatically recognized. ez-tabs.html also
provides the base CSS code so that the tabs visually behave as tabs. So with the
following code:

```html
<my-component>
  <div class="ez-tabs">
     <ul class="ez-tabs-list">
       <li class="ez-tabs-label is-tab-selected"><a href="#tab1">Tab 1</a></li>
       <li class="ez-tabs-label"><a href="#tab2">Tab 2</a></li>
     </ul>
     <div class="ez-tabs-panels">
       <div class="ez-tabs-panel is-tab-selected" id="tab1">Some content</div>
       <div class="ez-tabs-panel" id="tab2">Some other content</div>
     </div>
  </div>
</my-component>
```

You should see 2 tabs and should be able to switch from one to the other.

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

To keep the test browsers open (and keep the test web server alive), you can add
the `-p` option:

```bash
$ npm run test-local -- -p
```

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

### Run local demo of components

```bash
$ npm run serve
```

This will run a local web server to serve the demo. After running that command,
it should display the URL to reach the demo.

Alternatively, you can execute:

```bash
$ npm run serve -- -o
```

to open the index page in the default browser.
