(function () {
    const SINGLE_SELECTION_CLASS = 'ez-js-activable-element-single-selection';

    /**
     * ``<ez-selection-activate-element>` allows to activate one or several elements
     * (typically buttons) depending on a selection. To be recognized as such, those
     * elements must have the class `ez-js-activable-element`. The activable elements
     * can also be enabled only if the selection is unique. To have this behavior, the
     * activable element must also have the `ez-js-activable-element-single-selection`
     * class.
     *
     * By default, `<ez-selection-activate-element>` tracks all checkboxes, the
     * `selection-selector` attribute allows to restrict this behavior to a given
     * subset of checkboxes (or to radio buttons for instance).
     *
     * Examples:
     *
     * Enable a button based on a checkboxes:
     * ```
     * <ez-selection-activate-element>
     *     <ul>
     *         <li><input type="checkbox"></li>
     *         <li><input type="checkbox"></li>
     *     </ul>
     *     <button class="ez-js-activable-element" disabled>Do!</button>
     * </ez-selection-activate-element>
     * ```
     *
     * Enable a button only if one element is selected:
     * ```
     * <ez-selection-activate-element>
     *     <ul>
     *         <li><input type="checkbox"></li>
     *         <li><input type="checkbox"></li>
     *     </ul>
     *     <button class="ez-js-activable-element ez-js-activable-element-single-selection" disabled>Do!</button>
     * </ez-selection-activate-element>
     * ```
     *
     * Enable a button based on a subset of checkboxes:
     * ```
     * <ez-selection-activate-element selection-selector=".checkboxes-that-matches">
     *     <ul>
     *         <li><input type="checkbox" class"this-checkbox-will-not-match"></li>
     *         <li><input type="checkbox" class"checkboxes-that-matches"></li>
     *     </ul>
     *     <button class="ez-js-activable-element" disabled>Do!</button>
     * </ez-selection-activate-element>
     * ```
     *
     * Among others standard APIs, this component relies on `Element.matches`.
     * `Element.matches` is not available in Edge 14. So for this component to
     * work in those browsers, the page should include polyfills of those
     * standard API.
     *
     * @polymerElement
     * @demo demo/ez-selection-activate-element.html
     */
    class SelectionActivateElement extends Polymer.Element {
        static get is() {
            return 'ez-selection-activate-element';
        }

        static get properties() {
            return {
                /**
                 * Holds a selector for checkbox/radio inputs to track.
                 */
                selectionSelector: {
                    type: String,
                    value: 'input[type="checkbox"]',
                },
            };
        }

        connectedCallback() {
            super.connectedCallback();
            this.addEventListener('click', this._updateActivableElements.bind(this));
        }

        /**
         * Enables or disables the activable element depending on the checked
         * checkboxes or radio buttons.
         *
         * @param {Event} e
         */
        _updateActivableElements(e) {
            if (e.target.matches(this.selectionSelector)) {
                const activableElements = this._getActivableElements();
                const checkedElementsNumber = this._getCheckedElementsNumber();

                activableElements.forEach((element) => {
                    if (element.classList.contains(SINGLE_SELECTION_CLASS)) {
                        element.disabled = (checkedElementsNumber !== 1);
                    } else {
                        element.disabled = (checkedElementsNumber === 0);
                    }
                });
            }
        }

        /**
         * Returns the activable elements.
         *
         * @return {Array}
         */
        _getActivableElements() {
            return this.querySelectorAll('.ez-js-activable-element');
        }

        /**
         * Returns the number of selected elements.
         *
         * @return {Number}
         */
        _getCheckedElementsNumber() {
            return this.querySelectorAll(`${this.selectionSelector}:checked`).length;
        }
    }

    customElements.define(SelectionActivateElement.is, SelectionActivateElement);
})();
