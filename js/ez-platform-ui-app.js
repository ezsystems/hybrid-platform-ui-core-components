(function () {
    function updateElement(element, updateStruct) {
        if ( typeof updateStruct === 'string' ) {
            element.innerHTML = updateStruct;
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
     * for handling click on links and form submit and for fetching and applying
     * the corresponding update. It also manipulates the browser's history so
     * that the back and forward buttons works as expected. A large part of this
     * mechanism relies on the server ability to render the page as a JSON
     * update struct and that's why it's possible opt out from it.
     *
     * If a link has the class `ez-js-standard-navigation` or if it has an
     * ancestor having that class, the app will just let the navigation happen.
     * (or let another JavaScript code to handle click on such link)
     *
     * Example:
     * ```
     * <ul class="ez-js-standard-navigation">
     *   <li><a href="/">This link won't be enhanced</a></li>
     *   <li><a href="/path">Same for this one</a>
     * </ul>
     * <a href="/path2" class="ez-js-standard-navigation">Or this one</a>
     * ```
     *
     * For forms, the class `ez-js-standard-form` set on a form or on an
     * ancestor of a form allows the form to be submitted normally (or let
     * another JavaScript code to handle form submit).
     *
     * Example:
     * ```
     * <form action="/whatever" class="ez-js-standard-form">
     *   <input type="text" name="something" value="the app ignores me!">
     * </form>
     * <div class="ez-js-standard-form">
     *   <form action="/whatever">
     *     <input type="text" name="name" value="the app ignores me as well!">
     *   </form>
     * </div>
     * ```
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
                pageTitle: {
                    type: String,
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
         * Sets the page title. It's an observer of the `pageTitle` property.
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
         * Runs an AJAX request and updates the app with the given update url or
         * form.
         *
         * @param {String|HTMLFormElement} update either an URL to fetch or an
         * HTMLFormElement (POST) to submit
         */
        _update(update) {
            const fetchOptions = {
                credentials: 'same-origin',
                headers: new Headers({
                    'X-AJAX-Update': '1',
                }),
                redirect: 'follow',
            };
            let response;
            let url = update;

            if ( update instanceof HTMLFormElement ) {
                const data = new FormData(update);

                url = update.action;
                fetchOptions.method = update.method;
                if ( this._formButton ) {
                    data.append(this._formButton.name, this._formButton.value);
                }
                fetchOptions.body = data;
            }

            this.updating = true;

            fetch(url, fetchOptions)
                .then(this._checkRedirection.bind(this, url))
                .then((resp) => {
                    response = resp;
                    return resp.json();
                })
                .then(this._updateApp.bind(this))
                .then((struct) => this._endUpdate((fetchOptions.method === 'post'), response, struct))
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
         * @param {Response} response
         * @param {Object} struct
         * @return {Object}
         */
        _endUpdate(isPost, response, struct) {
            if ( isPost ) {
                this._replaceHistory();
            } else if ( !this._fromHistory ) {
                this._pushHistory();
            }
            delete this._fromHistory;

            this.updating = false;
            this._fireUpdated(response);

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
         *
         * @param {Response} response
         */
        _fireUpdated(response) {
            /**
             * Fired when the app has been updated.
             *
             * @event ez:app:updated
             */
            const updated = new CustomEvent('ez:app:updated', {
                bubbles: true,
                detail: {
                    response: response,
                },
            });

            this.dispatchEvent(updated);
        }

        /**
         * Pushes a new History entry.
         */
        _pushHistory() {
            history.pushState(
                {url: this.url, enhanced: true},
                this.pageTitle,
                this.url
            );
        }

        /**
         * Replaces the current History state with a new one.
         */
        _replaceHistory() {
            history.replaceState(
                {url: this.url, enhanced: true},
                this.pageTitle,
                this.url
            );
        }

        /**
         * Updates the app from the given `updateStruct` structure.
         *
         * @param {Object} updateStruct
         * @return {Object}
         */
        _updateApp(updateStruct) {
            updateElement.call(null, this, updateStruct.update);

            return updateStruct;
        }

        /**
         * Enhances the navigation by handling clicks on link, back button and
         * form submit.
         */
        _enhanceNavigation() {
            this.addEventListener('click', (e) => {
                const anchor = e.target.closest('a');

                if ( PlatformUiApp._isEnhancedNavigationLink(anchor) ) {
                    e.preventDefault();
                    this.url = anchor.href;
                } else if ( PlatformUiApp._isSubmitButton(e.target) && PlatformUiApp._isInsideEnhancedForm(e.target) ) {
                    this._formButton = e.target;
                }
            });
            this.addEventListener('submit', (e) => {
                const form = e.target;

                if ( !PlatformUiApp._isInsideEnhancedForm(form) ) {
                    return;
                }
                e.preventDefault();
                if ( form.method === 'get' ) {
                    // submitting a GET form is like browsing
                    this.url = PlatformUiApp._buildFormUrl(form, this._formButton);
                } else {
                    this._update(form);
                }
                delete this._formButton;
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
        static _isEnhancedNavigationLink(anchor) {
            // FIXME: we should probably further check the URI (same origin ?)
            return (
                anchor &&
                anchor.href &&
                anchor.getAttribute('href').indexOf('#') !== 0 &&
                !anchor.matches('.ez-js-standard-navigation, .ez-js-standard-navigation a')
            );
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

        /**
         * Checks whether the given `element` is inside (or is) a form that is
         * supposed to be enhanced (ie submitted by AJAX). To not be enhanced
         * the form or one of its ancestor must have the `ez-js-standard-form`
         * class.
         *
         * @param {HTMLElement} element
         * @static
         * @return {Boolean}
         */
        static _isInsideEnhancedForm(element) {
            const form = element.closest('form');

            return !form || !form.matches('.ez-js-standard-form, .ez-js-standard-form form');
        }

        /**
         * Builds the URL corresponding for the given GET `form` optionally
         * submitted with `submitButton`.
         *
         * @param {HTMLFormElement} form
         * @param {HTMLButtonElement|HTMLInputElement} [submitButton]
         * @static
         * @return {String}
         */
        static _buildFormUrl(form, submitButton) {
            // not using FormData because Safari 10.0 and Edge have an old
            // version which does not allow to retrieve actual data but even
            // with FormData, this is not trivial.
            const values = {};
            let url = form.action + '?';

            for (let i = 0; i != form.elements.length; i++) {
                const element = form.elements[i];
                const name = element.name;

                if ( !element.disabled ) {
                    switch (element.type) {
                        case 'button':
                        case 'reset':
                        case 'submit':
                            break;
                        case 'checkbox':
                            if ( element.checked ) {
                                values[name] = element.value || 'on';
                            }
                            break;
                        case 'radio':
                            if ( element.checked ) {
                                values[name] = element.value;
                            }
                            break;
                        case 'select-one':
                            if ( element.selectedIndex !== -1 ) {
                                values[name] = element.options[element.selectedIndex].value;
                            }
                            break;
                        case 'select-multiple':
                            Array.prototype.forEach.apply(element.options, function (option) {
                                if ( option.selected ) {
                                    values[name] = values[name] || [];
                                    values[name].push(option.value);
                                }
                            });
                            break;
                        default:
                            values[name] = element.value;
                    }
                }
            }
            if ( submitButton ) {
                values[submitButton.name] = submitButton.value;
            }
            Object.keys(values).forEach(function (key) {
                if ( Array.isArray(values[key]) ) {
                    values[key].forEach(function (value) {
                        url += `${key}[]=${value}&`;
                    });
                } else {
                    url += `${key}=${values[key]}&`;
                }
            });
            return url;
        }
    }

    window.customElements.define(PlatformUiApp.is, PlatformUiApp);
})();
