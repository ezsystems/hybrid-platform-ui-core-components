window.eZ = window.eZ || {};

(function (ns) {
    ns.mixins = ns.mixins || {};

    /**
     * Class expression mixin that adds support for fetching an URL or submitting
     * forms with an AJAX request.
     *
     * The resulting class relies on the `fetch` function which is not supported
     * by Safari 10.0. So for the resulting component to work in this browser,
     * the page should include a polyfill for this standard API.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.mixins.AjaxFetcher = function (superClass) {
        return class AjaxFetcher extends superClass {
            constructor() {
                super();
                this._trackFormButton();
            }

            /**
             * Makes sure a reference to the submit button used to submit a form
             * is stored in the property `_formButton`.
             * This needed for multi buttons form when the POST request body
             * should include which button was used.
             * Note: ideally, it should be possible to use
             * `document.activeElement` but unfortunatelly this does not work in
             * Firefox and Safari for MacOS.
             */
            _trackFormButton() {
                this.addEventListener('click', (e) => {
                    if ( AjaxFetcher._isSubmitButton(e.target) ) {
                        this._formButton = e.target;
                    } else {
                        delete this._formButton;
                    }
                });
            }

            /**
             * Runs an AJAX request for the `update` parameter with optionally
             * some `customHeaders`.
             *
             * @param {String|HTMLFormElement} update an URL or an form to
             * submit
             * @param {Object} [customHeaders = {}]
             * @return {Promise}
             */
            _fetch(update, customHeaders = {}) {
                const fetchOptions = {
                    credentials: 'same-origin',
                    headers: new Headers(customHeaders),
                    redirect: 'follow',
                };
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

                return fetch(url, fetchOptions);
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
        };
    };
})(window.eZ);
