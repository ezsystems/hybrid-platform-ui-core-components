(function () {
    /**
     * <ez-select-location> represents a clickable element in the application which will fire
     * the `ez:contentDiscover` event on click. This event is responsible for launching
     * the universal discovery widget component.
     *
     * @polymerElement
     * @demo demo/ez-select-location.html
     */
    class SelectLocation extends Polymer.Element {
        static get is() {
            return 'ez-select-location';
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
                        title: 'Select a location',
                        startingLocationId: this.selectedLocationId,
                        confirmLabel: 'Select this location',
                    },
                    listeners: {
                        'ez:confirm': (e) => {
                            this._locationSelected(e.detail.selection.location);
                        },
                    },
                },
                bubbles: true,
            });

            this.dispatchEvent(event);
        }

        /**
         * Dispatches `ez:locationSelected` event with the url given in the location.
         * @param {Object} location
         */
        _locationSelected(location) {
            const event = new CustomEvent('ez:locationSelected', {
                detail: {locationId: location.id},
                bubbles: true,
            });

            this.dispatchEvent(event);
        }
    }

    customElements.define(SelectLocation.is, SelectLocation);
})();
