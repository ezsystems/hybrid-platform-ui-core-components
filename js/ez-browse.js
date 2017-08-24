(function () {
    /**
     * <ez-browse> represents a clickable element in the application which will fire
     * the `ez:contentDiscover` event on click. This event is responsible for launching
     * the universal discovery widget component. The title of the UDW, its confirm label button
     * and the selected location id which will determine the starting location of the UDW are given to the event.
     * There is also a listnener on the `ez:confirm` event which will browse to a given location with the url
     * provided by the location.
     *
     * @polymerElement
     * @demo demo/ez-browse.html
     */
    class Browse extends Polymer.Element {
        static get is() {
            return 'ez-browse';
        }

        static get properties() {
            return {
                /**
                 * The selected location id which will determine the starting location id of the UDW.
                 */
                'selectedLocationId': {
                    type: Number,
                },
            };
        }

        constructor() {
            super();
            this.addEventListener('click', this._discoverContent.bind(this));
        }

        /**
         * Dispatches `ez:contentDiscover` event with config and listeners
         */
        _discoverContent() {
            const event = new CustomEvent('ez:contentDiscover', {
                detail: {
                    config: {
                        // Should be translatable in the future: https://jira.ez.no/browse/EZP-27527
                        title: 'Browse',
                        startingLocationId: this.selectedLocationId,
                        confirmLabel: 'View this content',
                    },
                    listeners: {
                        'ez:confirm': (e) => {
                            this._browseToLocation(e.detail.selection.location);
                        },
                    },
                },
                bubbles: true,
            });

            this.dispatchEvent(event);
        }

        /**
         * Dispatches `ez:navigateTo` event with the url given in the location.
         * @param {Object} location
         */
        _browseToLocation(location) {
            const event = new CustomEvent('ez:navigateTo', {
                detail: {url: location.url},
                bubbles: true,
            });

            this.dispatchEvent(event);
        }
    }

    customElements.define(Browse.is, Browse);
})();
