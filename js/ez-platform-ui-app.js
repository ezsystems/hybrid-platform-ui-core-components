(function () {
    function fetchUpdateStruct(updateUrl) {
        const headers = new Headers({
            'X-AJAX-Update': '1',
        });

        return fetch(updateUrl, {
            credentials: 'same-origin',
            headers: headers,
        }).then(function (response) {
            return response.json();
        });
    }

    function updateElement(element, updateStruct) {
        if ( typeof updateStruct === 'string' ) {
            // this replaces element.outerHTML = updateStruct;
            // because of https://github.com/webcomponents/custom-elements/issues/71
            const doc = (new DOMParser()).parseFromString(updateStruct, 'text/html');

            element = element.parentNode.replaceChild(doc.body.firstChild, element);
        } else if ( updateStruct ) {
            const attributes = updateStruct.attributes || {};
            const children = updateStruct.children || [];

            Object.keys(attributes).forEach(function (attributeName) {
                element.setAttribute(attributeName, attributes[attributeName]);
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
     * `<ez-platform-ui-app>` represents the application in a page. It is
     * responsible for handling click on links and for fetching and applying the
     * corresponding update.
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
                    observer: '_update',
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
         * Runs the update process by fetching the `updateUrl`. It's an observer
         * of the `url` property.
         *
         * @param {String} updateUrl
         * @param {String} oldUrl
         */
        _update(updateUrl, oldUrl) {
            if ( !oldUrl ) {
                // initial dispatch, no need for an update
                this._pushHistory();
                return;
            }
            this.updating = true;

            fetchUpdateStruct(updateUrl)
                .then(this._updateApp.bind(this))
                .then((struct) => {
                    this.updating = false;
                    this._pushHistory(true);
                    this._fireUpdated(updateUrl, struct);

                    return struct;
                });
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
         *
         * @param {Boolean} enhanced
         */
        _pushHistory(enhanced) {
            history.pushState(
                {url: this.url, enhanced: enhanced},
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
                // FIXME: need a polyfill for closest for Edge 14
                const anchor = e.target.closest('a');

                if ( PlatformUiApp._isNavigationLink(anchor) ) {
                    e.preventDefault();
                    this.url = anchor.href;
                }
            });
            window.addEventListener('popstate', (e) => {
                this._goBackToState(e.state);
            });
        }

        /**
         * Restores the given History `state`
         *
         * @param {Object} state
         */
        _goBackToState(state) {
            if ( !state || !state.url ) {
                return;
            }
            if ( state.enhanced ) {
                this.url = state.url;
            } else {
                location.href = state.url;
            }
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
    }

    window.customElements.define(PlatformUiApp.is, PlatformUiApp);
})();
