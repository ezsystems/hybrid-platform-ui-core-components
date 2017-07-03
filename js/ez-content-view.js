/* global eZ */
(function () {
    const Base = eZ.mixins.Notifier(customElements.get('ez-server-side-content'));

    /**
     * `<ez-content-view>` handles the HTML generated when viewing a Content item.
     * It extends `<ez-server-side-content>` and it adds the asynchronous loading
     * of tabs.
     *
     * @polymerElement
     * @demo demo/ez-content-view.html
     */
    class ContentView extends Base {
        static get is() {
            return 'ez-content-view';
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

    customElements.define(ContentView.is, ContentView);
})();
