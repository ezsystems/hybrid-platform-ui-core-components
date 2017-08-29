describe('ez-auto-submit', function () {
    let element;

    beforeEach(function () {
        element = fixture('AutoSubmitTestFixture');
    });

    it('should define `eZ.mixins.AutoSubmit`', function () {
        assert.isFunction(window.eZ.mixins.AutoSubmit);
    });

    describe('auto submit', function () {
        let form, input;

        beforeEach(function () {
            form = element.querySelector('form');
            input = form.elements[0];
            sinon.stub(form, 'submit');
        });

        afterEach(function () {
            form.submit.restore();
        });

        function addEventListenerOnce(element, eventName, listener) {
            const func = function () {
                element.removeEventListener(eventName, func);
                listener.apply(this, arguments);
            };

            element.addEventListener(eventName, func);
        }

        function simulateChange(input) {
            input.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                cancelable: true,
            }));
        }

        it('should auto-submit the form', function () {
            simulateChange(input);
            assert.isTrue(form.submit.called);
        });

        it('should not auto-submit the form', function () {
            form.classList.remove('ez-js-auto-submit');
            simulateChange(input);
            assert.isFalse(form.submit.called);
        });

        describe('submit event', function () {
            it('should dispatch the submit event', function () {
                let submitEvent = false;

                addEventListenerOnce(form, 'submit', function (e) {
                    e.preventDefault();
                    submitEvent = true;
                    assert.strictEqual(
                        e.target, form,
                        'The submit event should have been dispatched from the form'
                    );
                });

                simulateChange(input);
                assert.isTrue(submitEvent);
            });

            it('should take submit event cancellation into account', function () {
                addEventListenerOnce(form, 'submit', function (e) {
                    e.preventDefault();
                });

                simulateChange(input);
                assert.isFalse(form.submit.called);
            });
        });
    });
});
