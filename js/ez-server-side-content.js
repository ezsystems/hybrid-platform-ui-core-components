/* global eZ */
(function () {
    const Base = eZ.mixins.Notifier(eZ.mixins.Tabs(Polymer.Element));

    /**
     * <ez-server-side-content> allows to apply enhancements to a server side
     * generated content:
     *
     * - tabs handling thanks to the `eZ.mixins.Tabs` class expression mixin.
     * - asynchronous tabs loading with error handling
     *
     * Among others standard APIs, this component relies on `Element.closest`.
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in this browser, the page should include a polyfill for this
     * standard API.
     *
     * @polymerElement
     * @demo demo/ez-server-side-content.html
     */
    class ServerSideContent extends Base {
        static get is() {
            return 'ez-server-side-content';
        }

        connectedCallback() {
            super.connectedCallback();
            this._setupAsynchronousTabs();
        }

        /**
         * Adds event listeners to load and handle error loading error of
         * asynchronous tabs.
         */
        _setupAsynchronousTabs() {
            const isAsyncPanel = function (panel) {
                return panel instanceof customElements.get('ez-asynchronous-block');
            };

            this.addEventListener('ez:tabChange', (e) => {
                const panel = e.detail.panel;

                if ( isAsyncPanel(panel) && !panel.loaded ) {
                    panel.load();
                }
            });
            this.addEventListener('ez:asynchronousBlock:error', (e) => {
                const labelLink = this._getLabelLink(e.target);

                if ( isAsyncPanel(e.target) && labelLink ) {
                    e.stopPropagation();
                    this.notify({
                        type: 'error',
                        // FIXME: make that translatable, see https://jira.ez.no/browse/EZP-27527
                        content: `<p>Failed to load tab <em>${labelLink.textContent}</em></p>`,
                    });
                }
            });
        }
    }

    customElements.define(ServerSideContent.is, ServerSideContent);
})();
