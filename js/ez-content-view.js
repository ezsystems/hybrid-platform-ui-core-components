(function () {
    /**
     * `<ez-content-view>` handles the HTML generated when viewing a Content item.
     *
     * @polymerElement
     * @demo demo/ez-content-view.html
     */
    class ContentView extends customElements.get('ez-server-side-content') {
        static get is() {
            return 'ez-content-view';
        }

        connectedCallback() {
            super.connectedCallback();
            this._setupSubitemRefresh();
        }

        /**
         * Sets up a listener on `ez:asynchronousBlock:updated` to check whether
         * the default subitem ordering was changed. If it was, the subitems are
         * refreshed.
         */
        _setupSubitemRefresh() {
            this.addEventListener('ez:asynchronousBlock:updated', (e) => {
                const source = e.detail.source;

                if ( source instanceof HTMLFormElement && source.name === 'ordering' ) {
                    this._refreshSubitem();
                }
            });
        }

        /**
         * Refreshes the subitem list (if any)
         */
        _refreshSubitem() {
            const subitem = this.querySelector('ez-subitem');

            if ( subitem ) {
                subitem.refresh();
            }
        }
    }

    customElements.define(ContentView.is, ContentView);
})();
