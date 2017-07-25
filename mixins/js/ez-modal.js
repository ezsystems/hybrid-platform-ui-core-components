window.eZ = window.eZ || {};

/* global dialogPolyfill */
(function (ns) {
    ns.mixins = ns.mixins || {};

    /**
     * Mixins modal dialog support into a class extending `superClass`. The
     * resulting class is able to display a `<dialog>` element as a modal when
     * it contains the following markup:
     *
     * ```
     * <dialog class="ez-modal" id="mymodal">
     *   <p>Hello world!</p>
     *   <button type="button" class="ez-js-close-modal">Close modal</button>
     * </dialog>
     * <button type="button" class="ez-js-open-modal" value="#mymodal">Open 'mymodal'</button>
     * ```
     *
     * When clicking on a button with the class `ez-js-open-modal`, the
     * `<dialog>` element selected by the selector in the button value attribute
     * is opened as a modal (with `showModal` method) and the `<dialog>` receive
     * the class `is-modal-open` so that the opening is done with a CSS
     * transition. Clicking on any element with the class `ez-js-open-modal` in
     * the `<dialog>` element will close the modal and remove the class
     * `is-modal-open`.
     *
     * This mixin relies on the support for the `<dialog>` element which is only
     * supported by Chrome so this mixin automatically load a Polyfill to bring
     * this feature in others browsers.
     *
     * Among others standard APIs, this component relies on `Element.closest`.
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in this browser, the page should include a polyfill for this
     * standard API.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.mixins.Modal = function (superClass) {
        const MODAL_OPEN = 'is-modal-open';

        return class extends superClass {
            connectedCallback() {
                super.connectedCallback();
                this._setupModal();
            }

            /**
             * Setups click listeners to open or close the modal window.
             */
            _setupModal() {
                this.addEventListener('click', (e) => {
                    if ( e.target.matches('.ez-js-open-modal') ) {
                        this._openModal(e.target.value);
                    } else if ( e.target.matches('.ez-js-close-modal') ) {
                        this._closeModal(e.target.closest('dialog'));
                    }
                });
            }

            /**
             * Opens the dialog element selected by `selector` as a modal.
             *
             * @param {String} selector
             */
            _openModal(selector) {
                const dialog = this.querySelector(selector);

                dialogPolyfill.registerDialog(dialog);
                dialog.showModal();
                dialog.classList.add(MODAL_OPEN);
            }

            /**
             * Closes the dialog element.
             *
             * @param {HTMLDialogElement} dialog
             */
            _closeModal(dialog) {
                const close = function () {
                    dialog.removeEventListener('transitionend', close);
                    dialog.close();
                };

                dialog.addEventListener('transitionend', close);
                dialog.classList.remove(MODAL_OPEN);
            }
        };
    };

})(window.eZ);
