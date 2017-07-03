window.eZ = window.eZ || {};

(function (ns) {
    ns.mixins = ns.mixins || {};

    /**
     * Mixins tabs notification support into a class `superClass`. The resulting
     * class has  a`notify()` method to issue notification to the user.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.mixins.Notifier = function (superClass) {
        return class extends superClass {
            /**
             * Dispatches the `ez:notify` event with the given `notification`
             * object. This object can have the properties recognized by the
             * `ez-notification` custom element.
             *
             * @param {Object} notification
             */
            notify(notification) {
                this.dispatchEvent(new CustomEvent('ez:notify', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        notification: notification,
                    },
                }));
            }
        };
    };
})(window.eZ);
