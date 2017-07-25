window.eZ = window.eZ || {};

(function (ns) {
    ns.mixins = ns.mixins || {};

    /**
     * Returns a function that first calls `prependFunc` and then `func`
     *
     * @param {Function} prependFunc
     * @param {Function} func
     * @return {Function}
     */
    function prependFunction(prependFunc, func) {
        return function () {
            prependFunc.apply(null, arguments);
            func.apply(null, arguments);
        };
    }

    /**
     * Checks whether the given `element` is a submit button ie when clicking on
     * it the form should be submitted
     *
     * @param {HTMLElement} element
     * @return {Boolean}
     */
    function isSubmitButton(element) {
        return element.form && (element.type === 'submit' || element.type === 'image');
    }

    /**
     * Mixins support for running the Universal Discovery based on a convention
     * on any HTML element. The resulting class transforms a click on an element
     * (typically a button) with the class `ez-js-run-universal-discovery` in a
     * request to run the Universal Discovery. The Universal Discovery will be
     * configured based on `data-ud-*` attributes on the button itself:
     *
     * * `data-ud-multiple` when this boolean attribute is set, the Universal
     * Discovery is run with the `multiple` option set to true
     * * `data-ud-title` can be used to set the title of the Universal Discovery
     * * `data-ud-starting-location-id` can be used to set the starting Location
     * of the Universal Discovery
     * * `data-ud-confirm-label` can be used to set the label of the confirm
     * button in the Universal Discovery
     * * `data-ud-min-discover-depth` can be used to set the min discover depth
     * of the Universal Discovery
     * * `data-ud-visible-method` can be used to set the default visible method
     * in the Universal Discovery
     * * `data-ud-container` when this boolean attribute is set, the Universal
     * Discovery will be configured to only allow container Content item to be
     * selected.
     * * `data-ud-content-type-identifiers` expects a space separated list of
     * Content Type identifiers. When set, only Content items of the given list
     * of Content Types can be selected.
     * * `data-ud-confirm-fill` and `data-ud-confirm-fill-with` can be used to
     * fill a form input with a property of the selection.
     * `data-ud-confirm-fill` expects a selector matching an input.
     * `data-ud-confirm-fill-with` expects a string representing a path to a
     * property in the selection. For instance, to retrieve the Location id(s),
     * it should have the valueh `location.id`. If the Universal Discovery is
     * configured to allow a multiple selection, the input will be filled with
     * the corresponding value separated by a coma (e.g. `42,43` if the user
     * picked the Locations #42 and #43)
     *
     * When the Universal Discovery is run with that convention, the
     * `ez:runUniversalDiscovery:select` event is dispatched from the element
     * holding the `ez-js-run-universal-discovery` class. It is made to allow to
     * implement custom selection constraints (besides checking if the Content
     * is a container or is an instance of a Content Type):
     *
     * ```js
     * document.addEventListener('ez:runUniversalDiscovery:select', function (e) {
     *     // e.detail.selection contains the UD selection
     *     if ( selectionIsNotWhatIWant ) {
     *         e.preventDefault();
     *     }
     * });
     * ```
     *
     * After confirming the Universal Discovery selection, the event
     * `ez:runUniversalDiscovery:confirm` is dispatched from the element holding
     * the `ez-js-run-universal-discovery` class. This event is configured to
     * bubble, so it's possible for instance to listen to it from the document:
     *
     * ```js
     * document.addEventListener('ez:runUniversalDiscovery:confirm', function (e) {
     *     // e.detail.selection contains the UD selection
     * }
     * ```
     *
     * If the element holding the class `ez-js-run-universal-discovery` is a
     * submit button, after confirming the selection in the Universal Discovery,
     * the corresponding form will be submitted.
     *
     * Markup example:
     *
     * ```
     * <button type="submit" class="ez-js-run-universal-discovery"
     *     data-ud-multiple
     *     data-ud-title="Title of the UDW"
     *     data-ud-starting-location-id="43"
     *     data-ud-container
     *     data-ud-content-type-identifiers="folder article"
     *     data-ud-confirm-fill=".selector-of-input-to-fill"
     *     data-ud-confirm-fill-with="location.id">
     *   Run the Universal Discovery Widget
     * </button>
     * ```
     *
     * With that example, the Universal Discovery will allow a multiple
     * selection of folder and articles. It will be configured to start the
     * discovery at the Location which id is 43. After confirming the selection,
     * the input matching `.selector-of-input-to-fill` will be filled with the
     * Location ids and the form in which the button is will be submitted.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.mixins.RunUniversalDiscovery = function (superClass) {
        return class extends superClass {
            connectedCallback() {
                super.connectedCallback();
                this.addEventListener('click', (e) => {
                    const runUDElement = this._getRunUDElement(e.target);

                    if ( runUDElement ) {
                        e.preventDefault();
                        e.stopPropagation();
                        this._runUniversalDiscovery(runUDElement);
                    }
                });
            }

            /**
             * Runs the Universal Discovery with the parameters given by
             * `runUDElement`.
             *
             * @param {HTMLElement} runUDElement
             */
            _runUniversalDiscovery(runUDElement) {
                runUDElement.dispatchEvent(new CustomEvent('ez:contentDiscover', {
                    bubbles: true,
                    detail: {
                        config: this._getUDConfig(runUDElement),
                        listeners: this._getUDListeners(runUDElement),
                    },
                }));
            }

            /**
             * Returns the config for the Universal Discovery based on
             * `runUDElement`
             *
             * @param {HTMLElement} runUDElement
             * @return {Object}
             */
            _getUDConfig(runUDElement) {
                const dataset = runUDElement.dataset;

                return {
                    'multiple': !!dataset.udMultiple,
                    'title': dataset.udTitle,
                    'startingLocationId': dataset.udStartingLocationId,
                    'confirmLabel': dataset.udConfirmLabel,
                    'minDiscoverDepth': dataset.udMinDiscoverDepth,
                    'visibleMethod': dataset.udVisibleMethod,
                };
            }

            /**
             * Returns the listeners for the Universal Discovery based on
             * `runUDElement`
             *
             * @param {HTMLElement} runUDElement
             * @return {Object}
             */
            _getUDListeners(runUDElement) {
                return {
                    'ez:select': this._getUDSelectListener(runUDElement),
                    'ez:confirm': this._getUDConfirmListener(runUDElement),
                };
            }

            /**
             * Returns the confirm listener based on `runUDElement`
             *
             * @param {HTMLElement} runUDElement
             * @return {Function}
             */
            _getUDConfirmListener(runUDElement) {
                const dataset = runUDElement.dataset;
                let listener = (e) => {
                    this._dispatchConfirm(runUDElement, e.detail.selection);
                    if ( isSubmitButton(runUDElement) ) {
                        const form = runUDElement.form;

                        this._submitForm(form);
                    }
                };

                if ( dataset.udConfirmFill && dataset.udConfirmFillWith ) {
                    const fillInput = (e) => {
                        const input = this.querySelector(dataset.udConfirmFill);

                        input.value = this._getSelectionValue(
                            dataset.udMultiple,
                            e.detail.selection,
                            dataset.udConfirmFillWith
                        );
                    };

                    listener = prependFunction(fillInput, listener);
                }

                return listener;
            }

            /**
             * Dispatches the `ez:runUniversalDiscovery:confirm` event from
             * `runUDElement`
             *
             * @param {HTMLElement} runUDElement
             * @param {Object|Array} selection
             */
            _dispatchConfirm(runUDElement, selection) {
                runUDElement.dispatchEvent(new CustomEvent('ez:runUniversalDiscovery:confirm', {
                    bubbles: true,
                    cancelable: false,
                    detail: {
                        selection: selection,
                    },
                }));
            }

            /**
             * Returns a string representing the `selection` done with the
             * Universal Discovery by extracting the `path` from it.
             *
             * @param {Boolean} multiple
             * @param {Object|Array} selection
             * @param {String} path (e.g. `location.id`)
             * @return {String}
             */
            _getSelectionValue(multiple, selection, path) {
                const pathArray = path.split('.');

                if ( !multiple ) {
                    selection = [selection];
                }
                return selection.map(function (item) {
                    return pathArray.reduce(function (value, key) {
                        return value[key];
                    }, item);
                });
            }

            /**
             * Returns the select listener based on `runUDElement`
             *
             * @param {HTMLElement} runUDElement
             * @return {Function}
             */
            _getUDSelectListener(runUDElement) {
                const dataset = runUDElement.dataset;
                let listener = function (e) {
                    const event = new CustomEvent('ez:runUniversalDiscovery:select', {
                        bubbles: true,
                        cancelable: true,
                        detail: {
                            selection: e.detail.selection,
                        },
                    });

                    if ( !runUDElement.dispatchEvent(event) ) {
                        e.preventDefault();
                    }
                };

                if ( dataset.udContainer ) {
                    const restrictContainer = function (e) {
                        if ( !e.detail.selection.contentType.isContainer ) {
                            e.preventDefault();
                        }
                    };

                    listener = prependFunction(restrictContainer, listener);
                }
                if ( dataset.udContentTypeIdentifiers ) {
                    const restrictContentTypes = function (e) {
                        const identifiers = dataset.udContentTypeIdentifiers;
                        const list = identifiers.split(',').map(function (identifier) {
                            return identifier.trim();
                        });

                        if ( !list.includes(e.detail.selection.contentType.identifier) ) {
                            e.preventDefault();
                        }
                    };

                    listener = prependFunction(restrictContentTypes, listener);
                }

                return listener;
            }

            /**
             * Submits the `form` as if the user clicked on a submit button ie
             * it dispatches the `submit` event and if it's not prevented
             * actually submits the `form`.
             *
             * @param {HTMLFormElement} form
             */
            _submitForm(form) {
                const notPrevented = form.dispatchEvent(new CustomEvent('submit', {
                    bubbles: true,
                    cancelable: true,
                }));

                if ( notPrevented ) {
                    form.submit();
                }
            }

            /**
             * Get the closest element with the `ez-js-run-universal-discovery`
             * class if any.
             *
             * @param {HTMLElement} element
             * @return {HTMLElement|null}
             */
            _getRunUDElement(element) {
                return element.closest('.ez-js-run-universal-discovery');
            }
        };
    };
})(window.eZ);
