(function () {
    /**
    * `<ez-content-view>` handles the content generated when viewing a Content item.
    * It extends `<ez-server-side-content>`.
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
