(function () {
    /**
     * <ez-notification> represents a notification in the application. If a
     * timeout is provided, the notification automatically disappears after
     * timeout seconds otherwise, the user has to use the close button.
     *
     * Also, this element accepts a `details` property that can be copied when
     * `copyable` property is set to true with a "Copy to clipboard" button.
     * The copy to clipboard button can be styled with 2 custom properties:
     *
     * - `--ez-notification-copy-border-color` to set the button border color
     *   (white by default)
     * - `--ez-notification-copy-font-size` to set the button font size color
     *   (1em by default)
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

                /**
                 * Indicates whether `details` can be copied using a copy button
                 * integrated in the notification.
                 */
                copyable: {
                    type: Boolean,
                    value: false,
                },

                /**
                 * Holds details about the notification. If `copyable` is true,
                 * this can be copied to the clipboard.
                 */
                details: {
                    type: String,
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

        /**
         * Copies `details` property value to the clipboard.
         * It's a click event listener on the copy button.
         */
        _copyDetails() {
            const details = this.shadowRoot.querySelector('.details');

            // `copying` make sure the corresponding `textarea` can receive the
            // focus so that we can select its content and copy it.
            details.classList.add('copying');
            details.select();
            document.execCommand('copy');
            details.classList.remove('copying');
        }

        disconnectedCallback() {
            this._clearTimeout();
        }
    }

    window.customElements.define(Notification.is, Notification);
})();
