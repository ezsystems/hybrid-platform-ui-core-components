(function () {
    /**
     * `<ez-field-edit>` is supposed to wrap one or several HTML5 inputs. It tracks user input,
     *  and if an input is invalid, sets its own `invalid` property to true. It will also add an
     * `ez-invalid-input` class on lowest common parent node between the input and the label.
     * If there is no label it will add the class on the parent node of the input.
     * This class will be removed once the input gets valid.
     *
     * Warning: each element inside <ez-field-edit> can't own more than one couple <input> + <label>
     * Example of a correct markup:
     *
     *    <ez-field-edit>
     *        <div>
     *            <label for="input1">First Input </label>
     *            <input id="input1" type="text"">
     *        <div>
     *        <div>
     *            <input id="input2" type="text"">
     *            <h2>
     *                <label for="input2">Second Input </label>
     *            </h2>
     *        <div>
     *    </ez-field-edit>
     *
     * @polymerElement
     * @demo demo/ez-field-edit.html
     */
    class FieldEdit extends Polymer.Element {
        static get is() {
            return 'ez-field-edit';
        }

        static get properties() {
            return {
                /**
                 * Indicates if the field input is invalid.
                 */
                'invalid': {
                    type: Boolean,
                    value: false,
                    reflectToAttribute: true,
                },
            };
        }

        /**
         * Checks whether the inputs are valid or not and set the `invalid` property
         * accordingly.
         * Also set `ez-invalid-input` class on the lowest common ancestor between the label and the input.
         * If there is no label, sets it on the input's parent node.
         */
        _checkValidity() {
            let valid;
            let globalValidity = true;
            const invalidInputClass = 'ez-invalid-input';
            const toggleInvalidClass = (element, valid) => {
                const classList = element.classList;

                return valid ? classList.remove(invalidInputClass) : classList.add(invalidInputClass);
            };
            const getLabelsForFormElement = (input) => {
                const labels = input.id ? this.querySelectorAll(`label[for="${input.id}"]`) : [];

                return labels;
            };

            this.querySelectorAll('input, select, textarea').forEach((formElement) => {
                const labels = getLabelsForFormElement(formElement);

                valid = formElement.validity.valid;
                globalValidity = (globalValidity && valid);
                if (labels.length) {
                    labels.forEach((label) => {
                        const commonParent = this._getCommonAncestor(label, formElement);

                        toggleInvalidClass(commonParent, valid);
                    });
                } else {
                    toggleInvalidClass(formElement.parentNode, valid);
                }
            });
            this.invalid = !globalValidity;
        }

        /**
         * Returns the parent nodes of the given node until <ez-field-edit>.
         *
         * @param {HTMLElement} node
         * @return {Array}
         */
        _getAncestors(node) {
            const nodes = [];

            for (; node; node = node.parentNode) {
                nodes.unshift(node);
                if (node === this) {
                    break;
                }
            }
            return nodes;
        }

        /**
         * Returns the lowest common ancestor between the two given nodes.
         *
         * @param {HTMLElement} node1
         * @param {HTMLElement} node2
         * @return {HTMLElement}
         */
        _getCommonAncestor(node1, node2) {
            const parents1 = this._getAncestors(node1);
            const parents2 = this._getAncestors(node2);

            for (let i = 0; i < parents1.length; i++) {
                if (parents1[i] != parents2[i]) {
                    return parents1[i - 1];
                }
            }
        }

        connectedCallback() {
            super.connectedCallback();
            this.addEventListener('input', this._checkValidity.bind(this));
            this._checkValidity();
        }
    }

    customElements.define(FieldEdit.is, FieldEdit);
})();
