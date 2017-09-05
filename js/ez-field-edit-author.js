/* jshint esversion:6 */
(function () {
    const ROW_TEMPLATE = `
        <div class="field__row">
            <div class="field__input-wrapper">
                <label class="field__label">Full Name:</label>
                <input class="field__input" type="text" name="fullname[]" />
            </div>
            <div class="field__input-wrapper">
                <label class="field__label">Email:</label>
                <input class="field__input" type="text" name="email[]" />
            </div>
            <div class="field__btns">
                <div class="field__btns-wrapper">
                    <button type="button" class="field__btn--remove">Remove</button>
                    <button type="button" class="field__btn--add">Add</button>
                </div>
            </div>
            <div class="field__error">Error text</div>
        </div>
    `;
    const SELECTOR_ROW = '.field__row';

    class AuthorFieldEdit extends customElements.get('ez-field-edit') {
        static get is() {
            return 'ez-field-edit-author';
        }

        static get template() {
            return `
                <style>
                    :host {
                        color: var(--ez-color-text-base);
                        padding: 10px;
                        display: block;
                    }

                    :host, :host * {
                        box-sizing: border-box;
                        line-height: 1.4;
                        font-size: 15px;
                        font-family: var(--ez-base-font-family);
                    }

                    :host .field__label {
                        font-size: 1.1em;
                        font-weight: 700;
                        display: block;
                    }

                    :host .field__input {
                        border: 1px solid #b1d2e0;
                        border-radius: 4px;
                        box-shadow: none;
                        transition: box-shadow .3s ease-in-out;
                    }

                    :host .field__input:focus {
                        box-shadow: inset 0 0 8px #b1d2e0;
                        outline: none;
                    }

                    :host .field__row {
                        display: flex;
                        flex-wrap: wrap;
                    }

                    :host .field__input-wrapper,
                    :host .field__btns {
                        flex: 1 1 auto;
                    }

                    :host .field__error {
                        flex: 1 1 100%;
                        font-size: .75em;
                        font-style: italic;
                        color: #d92d42;
                        padding: 0 10px;
                    }

                    :host .field__input-wrapper + .field__input-wrapper,
                    :host .field__input-wrapper + .field__btns {
                        margin-left: 1em;
                    }

                    :host .field__input {
                        height: 1.4em;
                        width: 100%;
                    }

                    :host .field__btns {
                        display: flex;
                        align-items: flex-end;
                    }

                    :host [class^="field__btn--"] {
                        padding: .25em .65em;
                        border-radius: 4px;
                        text-align: center;
                        cursor: pointer;
                        letter-spacing: .5px;
                        border: 1px solid #757575;
                        background-color: #757575;
                        color: #fff;
                        font-size: 1em;
                    }

                    :host .field__btn--add {
                        font-weight: bold;
                        border: 1px solid #0f6d95;
                        background-color: #0f6d95;
                    }

                    :host .field__btn--remove {
                        font-weight: bold;
                        border: 1px solid #cb2540;
                        background-color: #cb2540;
                    }
                </style>
                <div class="field__title">Author:</div>
                <div class="field__rows">
                    ${ROW_TEMPLATE}
                </div>
            `;
        }

        connectedCallback() {
            super.connectedCallback();

            this._attachEventListeners();
        }

        /**
         * Adds event listeners related to a web component
         *
         * @method _attachEventListeners
         */
        _attachEventListeners() {
            this.addEventListener('click', this._renderNextRow.bind(this), false);
            this.addEventListener('click', this._removeRow.bind(this), false);
        }

        /**
         * Finds an element in a path items list with a given class name
         *
         * @method _findElementInPath
         *
         * @param className {String} element class name
         * @return {HTMLElement|undefined}
         */
        _findElementInPath(className) {
            return event.path.find(item => item.classList && item.classList.contains(className));
        }

        /**
         * Renders a new author row
         *
         * @method _renderNextRow
         * @param event {Event} event object
         */
        _renderNextRow(event) {
            if (!this._findElementInPath('field__btn--add')) {
                return;
            }

            this.shadowRoot.querySelector('.field__rows').insertAdjacentHTML('beforeend', ROW_TEMPLATE);
        }

        /**
         * Attempts to remove an author row.
         * If there's only one left then it won't remove anything.
         *
         * @method _removeRow
         */
        _removeRow() {
            const removeBtn = this._findElementInPath('field__btn--remove');

            if (!removeBtn) {
                return;
            }

            const allAuthorFields = this.shadowRoot.querySelectorAll(SELECTOR_ROW);
            const selectedRow = removeBtn.closest(SELECTOR_ROW);

            if (allAuthorFields.length === 1 || !selectedRow) {
                return;
            }

            selectedRow.remove();
        }
    };

    customElements.define(AuthorFieldEdit.is, AuthorFieldEdit);
})();
