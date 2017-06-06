(function () {
    /**
    * <ez-navigation-hub> represents the navigation hub of the application.
    * Zones can be selected to display the links refering to the different parts of the application.
    *
    * Zones in the navigation hub are identified by a data-zone-identifier containing the zone identifier.
    * Example :
    *
    *    <ul>
    *      <li data-zone-identifier="1">
    *        <a href="#">zone1</a>
    *      </li>
    *    </ul>
    *
    * To appear in a zone, a link should have a data-zone attribute containing the corresponding zone identifier.
    * In addition, such links should have the class ez-zone-link.
    * Example :
    *
    *   <ul class="ez-navigation">
    *     <li data-zone="1" class="ez-zone-link">
    *       <a href="url">link</a>
    *     </li>
    *   </ul>
    *
    * This component relies on`Element.matches` that is not available in Edge 14.
    * So for this component to work in this browser, the page should include a polyfill for this standard API.
    * @polymerElement
    * @demo demo/ez-navigation-hub.html
    */
    class NavigationHub extends Polymer.Element {
        static get is() {
            return 'ez-navigation-hub';
        }
        static get properties() {
            return {
                'activeZoneClass': {
                    type: String,
                    value: 'ez-active-zone',
                },
                'matchedLinkClass': {
                    type: String,
                    value: 'ez-matched-link',
                },
                'activeZone': {
                    type: String,
                    observer: '_updateActiveZone',
                },
                'matchedLinkUrl': {
                    type: String,
                    observer: '_highlightLink',
                },
            };
        }

        connectedCallback() {
            super.connectedCallback();
            this.addEventListener('click', (e) => {
                if ( e.target.matches('[data-zone-identifier] a') ) {
                    e.preventDefault();
                    this.activeZone = e.target.parentNode.getAttribute('data-zone-identifier');
                }
            });
            Polymer.RenderStatus.afterNextRender(this, function () {
                this._updateActiveZone(this.activeZone, undefined);
                this._highlightLink(this.matchedLinkUrl, undefined);
            });
        }

        /**
         * Checks whether the element has child elements. This is useful to
         * check if the DOM has been distributed before applying changes.
         *
         * @return {Boolean}
         */
        _hasContent() {
            return this.childElementCount;
        }

        /**
         * Highlights the active zone and updates navigation by showing the related links.
         * It's an observer of the 'activeZone' property.
         *
         * @param {String} newValue
         * @param {String} oldValue
         */
        _updateActiveZone(newValue, oldValue) {
            if ( !this._hasContent() ) {
                return;
            }
            this._highlightZone(oldValue, newValue);
            this._updateNavigation(oldValue, newValue);
        }

        /**
         * Returns the zone corresponding to the given identifier.
         *
         * @param {String} identifier
         * @return {HTMLElement}
         */
        _getZone(identifier) {
            return this.querySelector('[data-zone-identifier="' + identifier + '"]');
        }

        /**
         * Highlights the current active zone and unhighlight the previous one.
         *
         * @param {String} oldZoneIdentifier
         * @param {String} newZoneIdentifier
         */
        _highlightZone(oldZoneIdentifier, newZoneIdentifier) {
            if ( oldZoneIdentifier ) {
                this._getZone(oldZoneIdentifier).classList.remove(this.activeZoneClass);
            }
            if ( newZoneIdentifier ) {
                this._getZone(newZoneIdentifier).classList.add(this.activeZoneClass);
            }
        }

        /**
         * Returns every items corresponding to the given zone identifier.
         *
         * @param {String} identifier
         * @return {NodeList}
         */
        _getZoneItems(identifier) {
            return this.querySelectorAll('[data-zone="' + identifier + '"]');
        }

        /**
         * Updates navigation by showing the items of the current active zone
         * and removing the ones of the previous zone.
         *
         * @param {String} oldZoneIdentifier
         * @param {String} newZoneIdentifier
         */
        _updateNavigation(oldZoneIdentifier, newZoneIdentifier) {
            const forEach = Array.prototype.forEach;
            const isInActiveZoneClass = 'is-in-active-zone';

            if ( oldZoneIdentifier ) {
                forEach.call(this._getZoneItems(oldZoneIdentifier), function (link) {
                    link.classList.remove(isInActiveZoneClass);
                });
            }
            if ( newZoneIdentifier ) {
                forEach.call(this._getZoneItems(newZoneIdentifier), function (link) {
                    link.classList.add(isInActiveZoneClass);
                });
            }
        }

        /**
         * Returns the node by the given url
         *
         * @param {String} url
         * @return {HTMLElement}
         */
        _getItemByUrl(url) {
            return this.querySelector('[href="' + url + '"]').parentNode;
        }

        /**
         * Highlights the link corresponding to the given url and unhighlight the previous one.
         *
         * @param {String} newUrl
         * @param {String} oldUrl
         */
        _highlightLink(newUrl, oldUrl) {
            if ( !this._hasContent() ) {
                return;
            }
            if ( oldUrl ) {
                this._getItemByUrl(oldUrl).classList.remove(this.matchedLinkClass);
            }
            if ( newUrl ) {
                this._getItemByUrl(newUrl).classList.add(this.matchedLinkClass);
            }
        }
    }
    window.customElements.define(NavigationHub.is, NavigationHub);
})();
