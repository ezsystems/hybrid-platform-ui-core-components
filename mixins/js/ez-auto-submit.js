window.eZ = window.eZ || {};

(function (ns) {
    ns.mixins = ns.mixins || {};

    function submitForm(form) {
        const cancelled = !form.dispatchEvent(new CustomEvent('submit', {
            bubbles: true,
            cancelable: true,
        }));

        if ( !cancelled ) {
            form.submit();
        }
    }

    /**
     * Class expression mixin that adds support for auto submitted forms. When a
     * form element has the class `ez-js-auto-submit`, any change into that form
     * will submit it as if the user would have done it. This behaviour relies
     * on the DOM `change` event.
     *
     * Among others standard APIs, this component relies on `Element.closest`
     * which is not available in Edge 14. So for this component to work in this
     * browser, the page should include a polyfill for it.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    ns.mixins.AutoSubmit = function (superClass) {
        return class extends superClass {
            constructor() {
                super();
                this._trackChange();
            }

            /**
             * Subscribes to DOM change event. If the change event comes from an
             * input contained in a form with the `ez-js-auto-submit` class, the
             * form is submitted.
             */
            _trackChange() {
                this.addEventListener('change', (e) => {
                    const autoSubmitForm = e.target.closest('.ez-js-auto-submit');

                    if ( autoSubmitForm ) {
                        submitForm(autoSubmitForm);
                    }
                });
            }
        };
    };
})(window.eZ);
