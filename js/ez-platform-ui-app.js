(function () {
    function updateElement(element, updateStruct) {
        if ( typeof updateStruct === 'string' ) {
            // this replaces element.outerHTML = updateStruct;
            // because of https://github.com/webcomponents/custom-elements/issues/71
            const doc = (new DOMParser()).parseFromString(updateStruct, 'text/html');

            element = element.parentNode.replaceChild(doc.body.firstChild, element);
        } else if ( updateStruct ) {
            const properties = updateStruct.properties || {};
            const attributes = updateStruct.attributes || {};
            const children = updateStruct.children || [];

            Object.keys(attributes).forEach(function (attributeName) {
                element.setAttribute(attributeName, attributes[attributeName]);
            });
            Object.keys(properties).forEach(function (propertyName) {
                element[propertyName] = properties[propertyName];
            });
            children.forEach(function (childUpdate) {
                if ( childUpdate ) {
                    const child = element.querySelector(childUpdate.selector);

                    if ( child ) {
                        updateElement(child, childUpdate.update);
                    } else {
                        console.warn(`Unable to find ${childUpdate.selector} under`, element);
                    }
                }
            }, element);
        }
        return updateStruct;
    }

    /**
     * `<ez-platform-ui-app>` represents the application in a page which will
     * enhance the navigation by avoiding full page refresh. It is responsible
     * for handling click on links and for fetching and applying the
     * corresponding update.
     *
     * Among others standard APIs, this component relies on `fetch` and
     * `Element.closest`. `fetch` is not supported by Safari 10.0 and
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in those browser, the page should include polyfills of those
     * standard API.
     *
     * @polymerElement
     * @demo demo/ez-platform-ui-app.html
     */
    class PlatformUiApp extends Polymer.Element {
        static get is() {
            return 'ez-platform-ui-app';
        }

        static get properties() {
            return {
                /**
                 * Indicates whether the app is correctly waiting for a server
                 * response.
                 */
                updating: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false,
                },

                /**
                 * Title of the app page. It is the page title by default and
                 * changes are reflected to the page title as well.
                 */
                title: {
                    type: String,
                    reflectToAttribute: true,
                    value: document.title,
                    observer: '_setPageTitle',
                },

                /**
                 * The URL to fetch to get an update. Set to the page location
                 * href by default. Setting this value triggers an XHR request
                 * to fetch the update.
                 */
                url: {
                    type: String,
                    reflectToAttribute: true,
                    value: location.href,
                    observer: '_triggerUpdate',
                },
            };
        }

        constructor() {
            super();
            this._enhanceNavigation();
        }

        /**
         * Sets the page title. It's an observer of the `title` property.
         *
         * @param {String} newValue
         */
        _setPageTitle(newValue) {
            this.ownerDocument.title = newValue;
        }

        /**
         * Runs the update process if needed after the update of the `url`
         * property. It's an observer of the `url` property.
         *
         * @param {String} updateUrl
         * @param {String} oldUrl
         */
        _triggerUpdate(updateUrl, oldUrl) {
            if ( !oldUrl ) {
                // initial dispatch, no need for an update
                return;
            }
            if ( this.updating ) {
                // update of the URL after a redirect, so we don't retrigger
                // an AJAX request since we are in the middle of a request
                return;
            }
            this._update(updateUrl);
        }


        /**
         * Runs an AJAX request and updates the app with the given update
         * struct.
         *
         * @param {String|HTMLFormElement} update either an URL to fetch or an
         * HTMLFormElement to submit
         */
        _update(update) {
            const fetchOptions = {
                credentials: 'same-origin',
                headers: new Headers({
                    'X-AJAX-Update': '1',
                }),
                redirect: 'follow',
            };
            let url = update;

            if ( update instanceof HTMLFormElement ) {
                url = update.action;
                // FIXME
                // this is only valid for GET form
                fetchOptions.body = new FormData(update);
                fetchOptions.method = update.method;
                if ( this._formButton ) {
                    fetchOptions.body.append(this._formButton.name, this._formButton.value);
                    delete this._formButton;
                }
            }

            this.updating = true;

            fetch(url, fetchOptions)
                .then(this._checkRedirection.bind(this, url))
                .then((response) => response.json())
                .then(this._updateApp.bind(this))
                .then(this._endUpdate.bind(this, (fetchOptions.method === 'post')))
                .catch((error) => {
                    this.updating = false;

                    // FIXME
                    // https://jira.ez.no/browse/EZP-27374
                    // proper error handling
                    // this includes checking HTTP status code (>= 400) but also
                    // handling connection error and JSON decode issues as well.
                    console.error('Error fetching update', url, fetchOptions, error);
                });
        }

        /**
         * Ends the update process. It makes sure the History is correctly
         * updated, it also sets `updating` to false and fire the updated event
         * to signal the very end of the update process.
         *
         * @param {Boolean} isPost
         * @param {Object} struct
         * @return {Object}
         */
        _endUpdate(isPost, struct) {
            if ( isPost ) {
                this._replaceHistory();
            } else if ( !this._fromHistory ) {
                this._pushHistory();
            }
            delete this._fromHistory;

            this.updating = false;
            this._fireUpdated();

            return struct;
        }

        /**
         * Checks whether the server redirected to a new URL. If yes, it updates
         * the `url` property to keep it in sync with the actual app state.
         *
         * @param {String} requestUrl
         * @param {Response} response
         * @return {Response}
         */
        _checkRedirection(requestUrl, response) {
            if ( !response.url.endsWith(requestUrl) ) {
                this.url = response.url;
            }

            return response;
        }

        /**
         * Fires the `ez:app:updated` event.
         */
        _fireUpdated() {
            /**
             * Fired when the app has been updated.
             *
             * @event ez:app:updated
             */
            const updated = new CustomEvent('ez:app:updated', {
                bubbles: true,
            });

            this.dispatchEvent(updated);
        }

        /**
         * Pushes a new History entry.
         */
        _pushHistory() {
            history.pushState(
                {url: this.url, enhanced: true},
                this.title,
                this.url
            );
        }

        /**
         * Replaces the current History state with a new one.
         */
        _replaceHistory() {
            history.replaceState(
                {url: this.url, enhanced: true},
                this.title,
                this.url
            );
        }

        /**
         * Updates the app from the given `updateStruct` structure.
         *
         * @param {Object} updateStruct
         */
        _updateApp(updateStruct) {
            updateElement.call(null, this, updateStruct.update);
        }

        /**
         * Enhances the navigation by handling clicks on link and back button.
         */
        _enhanceNavigation() {
            this.addEventListener('click', (e) => {
                const anchor = e.target.closest('a');

                if ( PlatformUiApp._isNavigationLink(anchor) ) {
                    e.preventDefault();
                    this.url = anchor.href;
                } else if ( PlatformUiApp._isSubmitButton(e.target) ) {
                    this._formButton = e.target;
                }
            });
            this.addEventListener('submit', (e) => {
                // FIXME:
                // like the navigation, it should be possible to opt out from
                // that "enhanced" behaviour for instance by setting a class on
                // the form itself or one of its ancestors.
                e.preventDefault();
                this._update(e.target);
            });
            this._popstateHandler = (e) => {
                this._goBackToState(e.state);
            };
            window.addEventListener('popstate', this._popstateHandler);
        }

        destructor() {
            window.removeEventListener('popstate', this._popstateHandler);
            super.destructor();
        }

        /**
         * Restores the given History `state`
         *
         * @param {Object} state
         */
        _goBackToState(state) {
            if ( !state || !state.url || !state.enhanced ) {
                return;
            }
            this._fromHistory = true;
            this.url = state.url;
        }

        /**
         * Checks whether the given `anchor` is suitable for the enhanced
         * navigation.
         *
         * @param {Element} anchor
         * @static
         * @return {Boolean}
         */
        static _isNavigationLink(anchor) {
            // FIXME: we should probably further check the URI (same origin ?)
            // we should also allow to opt out from that with a class
            return anchor && anchor.href && anchor.getAttribute('href').indexOf('#') !== 0;
        }

        /**
         * Checks whether the given `element` is a form submit button.
         *
         * @param {HTMLElement} element
         * @static
         * @return {Boolean}
         */
        static _isSubmitButton(element) {
            return element && element.matches('form input[type="submit"], form button, form input[type="image"]');
        }
    }

    window.customElements.define(PlatformUiApp.is, PlatformUiApp);
})();
