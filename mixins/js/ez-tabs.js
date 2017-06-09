window.eZ = window.eZ || {};

(function (ns) {
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
     * Among others standard APIs, this component relies on `Element.closest`.
     * `Element.closest` is not available in Edge 14. So for this component to
     * work in this browser, the page should include a polyfill for this
     * standard API.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.TabsMixin = function (superClass) {
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
                this.addEventListener('click', (e) => {
                    const label = e.target.closest('.ez-tabs-label');

                    if ( label ) {
                        e.preventDefault();
                        this._changeTab(e.target.getAttribute('href'), label);
                    }
                });
            }

            /**
             * Changes tab so that the tab panel corresponding to `panelSelector`
             * becomes visible and `tabsLabel` element is visually selected.
             *
             * @param {String} panelSelector
             * @param {HTMLElement} tabsLabel
             */
            _changeTab(panelSelector, tabsLabel) {
                this._unselectTab();

                tabsLabel.classList.add(TAB_IS_SELECTED);
                this.querySelector(panelSelector).classList.add(TAB_IS_SELECTED);
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
        };
    };
})(window.eZ);
