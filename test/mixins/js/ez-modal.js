describe('ez-modal', function () {
    let element;

    beforeEach(function () {
        element = fixture('ModalTestFixture');
    });

    it('should define `eZ.mixins.Modal`', function () {
        assert.isFunction(window.eZ.mixins.Modal);
    });

    describe('modal', function () {
        function simulateClick(el) {
            el.dispatchEvent(new CustomEvent('click', {
                bubbles: true,
            }));
        }

        function addEventListenerOnce(element, eventName, listener) {
            const func = function () {
                element.removeEventListener(eventName, func);
                listener.apply(this, arguments);
            };

            element.addEventListener(eventName, func);
        }

        describe('opening', function () {
            it('should be opened', function (done) {
                const modal = element.querySelector('.ez-modal');
                const assertOpenWithTransition = function (e) {
                    assert.strictEqual(
                        modal, e.target,
                        'The transition should occur on the dialog itself'
                    );
                    assert.isTrue(
                        modal.classList.contains('is-modal-open'),
                        'The dialog should have the `is-modal-open` class'
                    );
                    assert.isTrue(modal.open);
                    done();
                };

                simulateClick(element.querySelector('[value="#modal"]'));
                addEventListenerOnce(modal, 'transitionend', assertOpenWithTransition);
            });
        });

        describe('hiding', function () {
            it('should be hidden', function (done) {
                const modal = element.querySelector('.ez-modal');

                addEventListenerOnce(modal, 'transitionend', function () {
                    simulateClick(modal.querySelector('button'));
                    addEventListenerOnce(modal, 'transitionend', function (e) {
                        assert.strictEqual(
                            modal, e.target,
                            'The transition should occur on the dialog itself'
                        );
                        assert.isFalse(
                            modal.classList.contains('is-modal-open'),
                            'The dialog should not have the `is-modal-open` class'
                        );
                        assert.isFalse(modal.open);
                        done();
                    });
                });

                simulateClick(element.querySelector('[value="#modal"]'));
            });
        });
    });
});
