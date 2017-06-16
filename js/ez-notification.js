(function () {
    /**
     * <ez-notification> represents a notification in the application. If a
     * timeout is provided, the notification automatically disappears after
     * timeout seconds otherwise, the user has to use the close button.
     *
     * Example:
     *
     * ```
     * <ez-notification type="error" timeout="10">
     *   <p>
     *      <em>Oops</em>
     *      there was an error some where, but I'll be removed after 10 seconds
     *   </p>
     * </ez-notification>
     * ```
     *
     * @polymerElement
     * @demo demo/ez-notification.html
     */
    class Notification extends Polymer.Element {
        static get is() {
            return 'ez-notification';
        }

        static get properties() {
            return {
                /**
                 * The notification type. This property is reflected as an
                 * attribute so that it's possible to style notification
                 * depending this value.
                 */
                type: {
                    type: String,
                    reflectToAttribute: true,
                    value: '',
                },

                /**
                 * The notification timeout. After timeout seconds, the
                 * notification is automatically removed.
                 */
                timeout: {
                    type: Number,
                    value: 0,
                    observer: '_setTimeout',
                },
            };
        }

        /**
         * Schedules the notification removal after `timeout` second. It's an
         * observer of the `timeout` property.
         *
         * @param {Number} timeout
         */
        _setTimeout(timeout) {
            this._clearTimeout();
            if ( timeout ) {
                this._timeoutID = setTimeout(this.remove.bind(this), timeout * 1000);
            }
        }

        /**
         * Removes the scheduled notification removal if any
         */
        _clearTimeout() {
            if ( this._timeoutID ) {
                clearTimeout(this._timeoutID);
            }
        }

        disconnectedCallback() {
            this._clearTimeout();
        }
    }

    window.customElements.define(Notification.is, Notification);
})();
