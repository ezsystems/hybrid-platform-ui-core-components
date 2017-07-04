/* global eZ */
(function () {
    // FIXME: after https://jira.ez.no/browse/EZP-27582
    // remove that function!
    function filterTabHTMLCode(htmlCode) {
        const doc = (new DOMParser()).parseFromString(htmlCode, 'text/html');
        const main = doc.querySelector('main');

        if ( main ) {
            return main.innerHTML;
        }
        return htmlCode;
    }

    /**
     * `<ez-asynchronous-block>` represents a block that can be loaded
     * asynchronously. It exposes a `load()` method that will request its `url`.
     * If the request is successful, it dispatches the
     * `ez:asynchronousBlock:updated` event, if it's not an
     * `ez:asynchronousBlock:error` event is dispatched.
     *
     * Among others standard APIs, this component relies on `fetch`. `fetch` is
     * not supported by Safari 10.0. So for this component to work in those
     * browser, the page should include a polyfill of this standard API.
     *
     * @polymerElement
     * @demo demo/ez-asynchronous-block.html
     */
    class AsynchronousBlock extends eZ.mixins.AjaxFetcher(Polymer.Element) {
        static get is() {
            return 'ez-asynchronous-block';
        }

        static get properties() {
            return {
                /**
                 * Indicates whether the block is correctly loading the URL
                 */
                loading: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false,
                },

                /**
                 * Indicates whether the block successfully loaded.
                 */
                loaded: {
                    type: Boolean,
                    value: false,
                },

                /**
                 * The URL to fetch to get the block content
                 */
                url: {
                    type: String,
                },
            };
        }

        /**
         * Loads the Asynchronous Block content. If the loading is successful,
         * the `loaded` property is set to true and the
         * `ez:asynchronousBlock:updated` event is dispatched.
         */
        load() {
            this.loading = true;
            // FIXME: after https://jira.ez.no/browse/EZP-27582
            // this._fetch should have a second parameter with the header
            // so the server generates the HTML without the app layout
            this._fetch(update)
                .then((response) => {
                    if ( response.status >= 400 ) {
                        throw new Error();
                    }
                    return response;
                })
                .then((response) => response.text())
                .then((htmlCode) => {
                    this.loading = false;
                    // FIXME: after https://jira.ez.no/browse/EZP-27582
                    // this is a workaround needed because the returned tab code
                    // is decorated with the App Layout.
                    // when EZP-27582 is implemented, the following line should
                    // be:
                    // this.innerHTML = htmlCode;
                    this.innerHTML = filterTabHTMLCode(htmlCode);
                    this.loaded = true;
                    this._dispatchUpdated();
                })
                .catch((error) => {
                    this.loading = false;
                    this._dispatchError(error);
                });
        }

        /**
         * Dispatches the `ez:asynchronousBlock:updated` event. It is configured
         * to bubble but it is not cancelable.
         */
        _dispatchUpdated() {
            this.dispatchEvent(new CustomEvent('ez:asynchronousBlock:updated', {
                bubbles: true,
                cancelable: false,
            }));
        }

        /**
         * Dispatches the `ez:asynchronousBlock:error` event. It is configured
         * to bubble but it is not cancelable. It also carries the `error`
         * object
         *
         * @param {Error} error
         */
        _dispatchError(error) {
            this.dispatchEvent(new CustomEvent('ez:asynchronousBlock:error', {
                bubbles: true,
                cancelable: false,
                detail: {
                    error: error,
                },
            }));
        }
    }

    window.customElements.define(AsynchronousBlock.is, AsynchronousBlock);
})();
