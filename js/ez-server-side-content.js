/* global eZ */
(function () {
    /**
     * <ez-server-side-content> allows to apply enhancement to a server side
     * generated content. For now, this class is able to handle the tabs markup
     * thanks to the eZ.TabsMixin.
     *
     * Among others standard APIs, this component relies on `Element.closest`.
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in this browser, the page should include a polyfill for this
     * standard API.
     *
     * @polymerElement
     * @demo demo/ez-server-side-content.html
     */
    class ServerSideContent extends eZ.TabsMixin(Polymer.Element) {
        static get is() {
            return 'ez-server-side-content';
        }
    }

    customElements.define(ServerSideContent.is, ServerSideContent);
})();
