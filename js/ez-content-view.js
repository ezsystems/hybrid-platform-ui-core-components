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

    }

    customElements.define(ContentView.is, ContentView);
})();
