window.eZ = window.eZ || {};

(function (ns) {
    ns.mixins = ns.mixins || {};

    /**
     * Mixins tabs support into a class extending `superClass`. The resulting
     * class expects the following HTML markup for tabs to work and to be styled
     * correctly:
     *
     * <div class="ez-tabs">
     *   <ul class="ez-tabs-list">
     *     <li class="ez-tabs-label is-tab-selected"><a href="#tab1">Tab 1</a></li>
     *     <li class="ez-tabs-label"><a href="#tab2">Tab 2</a></li>
     *   </ul>
     *   <div class="ez-tabs-panels">
     *     <div class="ez-tabs-panel is-tab-selected" id="tab1">Some content</div>
     *     <div class="ez-tabs-panel" id="tab2">Some other content</div>
     *   </div>
     * </div>
     *
     * When switching tab, the event `ez:tabChange` is dispatched. This event is
     * configured to bubble and to be cancelable. It also carries the tab label
     * element and the tab panel element that are going to be selected.
     * This event can be used like:
     *
     * ```js
     * document.addEventListener('ez:tabChange', function (e) {
     *     // a new tab is about to be selected
     *     // e.detail.label is the `.ez-tabs-label` element that is about to be
     *     // selected
     *     // e.detail.panel is the `.ez-tabs-panel` element that is about to be
     *     // selected
     *     if (whatEverReason) {
     *         // prevent the active tab to be changed
     *         e.preventDefault();
     *     }
     * });
     * ```
     *
     * Among others standard APIs, this component relies on `Element.closest`.
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in this browser, the page should include a polyfill for this
     * standard API.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.mixins.Tabs = function (superClass) {
        const TAB_IS_SELECTED = 'is-tab-selected';

        return class extends superClass {
            connectedCallback() {
                super.connectedCallback();
                this._setupTabs();
            }

            /**
             * Sets up the tabs so that a user can switch from one tab to
             * another by clicking on tabs label.
             */
            _setupTabs() {
                this.addEventListener('click', this._processTabChange.bind(this));
            }

            /**
             * Processes the tab change. It's a click event handler. This
             * includes dispatching the `ez:tabChange` event. If it's not
             * prevented, a new tab is selected.
             *
             * @param {Event} e
             */
            _processTabChange(e) {
                const label = e.target.closest('.ez-tabs-label');

                if ( label ) {
                    const panel = this.querySelector(e.target.getAttribute('href'));

                    e.preventDefault();
                    if ( this._dispatchTabChange(label, panel) ) {
                        this._changeTab(panel, label);
                    }
                }
            }

            /**
             * Dispatches the `ez:tabChange` event.
             *
             * @param {HTMLElement} label
             * @param {HTMLElement} panel
             * @return {Boolean} whether the event was prevented
             */
            _dispatchTabChange(label, panel) {
                return this.dispatchEvent(new CustomEvent('ez:tabChange', {
                    detail: {
                        label: label,
                        panel: panel,
                    },
                    bubbles: true,
                    cancelable: true,
                }));
            }

            /**
             * Changes tab so that the tab `panel` element becomes visible and
             * `tabsLabel` element is visually selected.
             *
             * @param {HTMLElement} panel
             * @param {HTMLElement} tabsLabel
             */
            _changeTab(panel, tabsLabel) {
                this._unselectTab();

                tabsLabel.classList.add(TAB_IS_SELECTED);
                panel.classList.add(TAB_IS_SELECTED);
            }

            /**
             * Unselects currently selected tabs
             */
            _unselectTab() {
                const forEach = Array.prototype.forEach;

                forEach.call(this.querySelectorAll('.' + TAB_IS_SELECTED), function (element) {
                    element.classList.remove(TAB_IS_SELECTED);
                });
            }

            /**
             * Returns the label link for the given `panel` element.
             *
             * @param {HTMLElement} panel
             * @return {HTMLElement}
             */
            _getLabelLink(panel) {
                return this.querySelector(`[href="#${panel.id}"]`);
            }
        };
    };
})(window.eZ);
