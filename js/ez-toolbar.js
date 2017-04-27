(function () {
    /**
    * <ez-toolbar> represents the toolbar of the application.
    * It can be visible or not.
    *
    * @polymerElement
    * @demo demo/ez-toolbar.html
    */
    class EzToolbar extends Polymer.Element {
        static get is() {
            return 'ez-toolbar';
        }

        static get properties() {
            return {
                /**
                 * Indicates whether the toolbar is visible or not.
                 */
                visible: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false,
                },
            };
        }
    }

    window.customElements.define(EzToolbar.is, EzToolbar);
})();
