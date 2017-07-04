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
     * It also responsible for handling a local navigation, that means:
     *
     * - form submit will be done with an AJAX request and the block will be
     *   updated with the server response
     * - click on links with the class `ez-js-local-navigation` or descendant of
     *   an element with that class will be transformed into an AJAX request and
     *   the block will be updated with the server response.
     *
     * Among others standard APIs, this component relies on `fetch` and
     * `Element.closest`. `fetch` is not supported by Safari 10.0 and
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in those browser, the page should include polyfills of those
     * standard API.
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

        connectedCallback() {
            super.connectedCallback();
            this._setupLocalNavigation();
        }

        /**
         * Adds a event listeners to implement the *local* navigation.
         * If a user clicks on a link with the class `ez-js-local-navigation` or
         * which is descendant of an element with that class, the Asynchronous
         * Block will do the corresponding AJAX request and updates itself with
         * the response.
         * For forms, a form submit is transformed into an AJAX request and the
         * element is updated with the server response.
         */
        _setupLocalNavigation() {
            this.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.load(e.target);
            });
            this.addEventListener('click', function (e) {
                const target = e.target;

                if ( target.matches('.ez-js-local-navigation, .ez-js-local-navigation a') ) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.load(target.href);
                }
            });
        }

        /**
         * Loads the Asynchronous Block content. If `source` is not provided,
         * the url property is requested, otherwise the `source` parameter is
         * used.
         * If the loading is successful, the `loaded` property is set to true
         * and the `ez:asynchronousBlock:updated` event is dispatched. In case
         * of error (no reply from the server, HTTP status code >= 400), the
         * `ez:asynchronousBlock:error` event is dispatched with the
         * corresponding Error object.
         *
         * @param {String|HTMLFormElement} [source]
         */
        load(source) {
            const update = source || this.url;

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
