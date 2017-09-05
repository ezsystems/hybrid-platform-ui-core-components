describe('ez-auto-submit', function () {
    let element;

    beforeEach(function () {
        element = fixture('AutoSubmitTestFixture');
    });

    it('should define `eZ.mixins.AutoSubmit`', function () {
        assert.isFunction(window.eZ.mixins.AutoSubmit);
    });

    describe('auto submit', function () {
        let form, input, iframe;

        beforeEach(function () {
            form = element.querySelector('form');
            input = form.elements[0];

            sinon.stub(form, 'submit');
            // this is very very tricky... It seems like overriding
            // form.submit() is not enough in Firefox to prevent the
            // form from being submitted and this interrupts the unit
            // tests since the page is reloaded. To avoid that, the form
            // is submitted in an iframe
            iframe = document.createElement('iframe');
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
            iframe.name = 'iframe';
            form.target = iframe.name;
        });

        afterEach(function () {
            form.submit.restore();
            iframe.remove();
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
