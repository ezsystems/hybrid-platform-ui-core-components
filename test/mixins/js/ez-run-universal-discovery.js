describe('ez-run-universal-discovery', function () {
    it('should define `eZ.mixins.RunUniversalDiscovery`', function () {
        assert.isFunction(window.eZ.mixins.RunUniversalDiscovery);
    });

    describe('run universal discovery', function () {
        let element;

        beforeEach(function () {
            element = fixture('RunUDTestFixture');
        });

        function getClickEvent() {
            return new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            });
        }

        function simulateClick(element, event = getClickEvent()) {
            element.dispatchEvent(event);
            return event;
        }

        function addEventListenerOnce(element, event, listener) {
            const func = function () {
                element.removeEventListener(event, func);
                listener.apply(element, arguments);
            };

            element.addEventListener(event, func);
        }

        describe('run universal discovery element', function () {
            function testClickTransformedToContentDiscover(event, element, clickElement, button) {
                let runUD = false;

                sinon.spy(event, 'stopPropagation');
                addEventListenerOnce(element, 'ez:contentDiscover', function (e) {
                    runUD = true;

                    assert.strictEqual(
                        e.target, button,
                        'The `ez:contentDiscover` event should come from the button'
                    );
                });

                simulateClick(clickElement, event);

                assert.isTrue(
                    event.defaultPrevented,
                    'The click event should have been prevented'
                );
                assert.isTrue(
                    event.stopPropagation.calledOnce,
                    'The click event propagation should have been stopped'
                );
                assert.isTrue(runUD);
            }

            it('should run the universal discovery', function () {
                const button = element.querySelector('.no-submit');
                const event = getClickEvent();

                testClickTransformedToContentDiscover(event, element, button, button);
            });

            it('should run the universal discovery with a sub element', function () {
                const button = element.querySelector('.no-submit');
                const subElement = button.querySelector('span');
                const event = getClickEvent();

                testClickTransformedToContentDiscover(event, element, subElement, button);
            });

            it('should ignore other button', function () {
                const button = element.querySelector('.no-action');
                const event = simulateClick(button);

                assert.isFalse(
                    event.defaultPrevented,
                    'The click event should not have been prevented'
                );
            });
        });

        describe('config', function () {
            let button;

            beforeEach(function () {
                button = element.querySelector('.no-submit');
            });

            function testUDConfig(element, button, dataAttr, dataAttrValue, configProp) {
                let runUD = false;

                button.setAttribute(dataAttr, dataAttrValue);

                addEventListenerOnce(element, 'ez:contentDiscover', function (e) {
                    runUD = true;

                    assert.strictEqual(dataAttrValue, e.detail.config[configProp]);
                });
                simulateClick(button);

                assert.isTrue(runUD, 'The `ez:contentDiscover` should have been dispatched');
            }

            it('should read multiple parameter', function () {
                testUDConfig(element, button, 'data-ud-multiple', true, 'multiple');
            });

            it('should read title parameter', function () {
                testUDConfig(element, button, 'data-ud-title', 'Walkin\' on the sun', 'title');
            });

            it('should read the starting Location id parameter', function () {
                testUDConfig(element, button, 'data-ud-starting-location-id', '43', 'startingLocationId');
            });
        });

        describe('select listener', function () {
            let button;

            beforeEach(function () {
                button = element.querySelector('.no-submit');
            });

            function getSelectListener(button) {
                let listener;

                addEventListenerOnce(button, 'ez:contentDiscover', function (e) {
                    listener = e.detail.listeners['ez:select'];
                });
                simulateClick(button);

                return listener;
            }

            function getSelectEvent(contentType) {
                return new CustomEvent('ez:select', {
                    cancelable: true,
                    detail: {
                        selection: {
                            contentType: contentType,
                        },
                    },
                });
            }

            describe('container', function () {
                let listener;

                beforeEach(function () {
                    button.setAttribute('data-ud-container', true);
                    listener = getSelectListener(button);
                });

                it('should allow container', function () {
                    const selectContainer = getSelectEvent({isContainer: true});

                    listener(selectContainer);
                    assert.isFalse(
                        selectContainer.defaultPrevented,
                        'The selection of a container should not have been prevented'
                    );
                });

                it('should disallow non container', function () {
                    const selectNotContainer = getSelectEvent({isContainer: false});

                    listener(selectNotContainer);
                    assert.isTrue(
                        selectNotContainer.defaultPrevented,
                        'The selection of a non container should have been prevented'
                    );
                });
            });

            describe('content types', function () {
                let listener;

                beforeEach(function () {
                    button.setAttribute(
                        'data-ud-content-type-identifiers',
                        'folder,    trim-applied  '
                    );
                    listener = getSelectListener(button);
                });

                function testAllowContentType(identifier) {
                    const allow = getSelectEvent({identifier: identifier});

                    listener(allow);
                    assert.isFalse(
                        allow.defaultPrevented,
                        `The selection of '${identifier}' should not have been prevented`
                    );
                }

                function testDisallowContentType(identifier) {
                    const disallow = getSelectEvent({identifier: identifier});

                    listener(disallow);
                    assert.isTrue(
                        disallow.defaultPrevented,
                        `The selection of '${identifier}' should have been prevented`
                    );
                }

                it('should allow `folder`', function () {
                    testAllowContentType('folder');
                });

                it('should disallow `article`', function () {
                    testDisallowContentType('article');
                });

                it('should allow `trim-applied`', function () {
                    testAllowContentType('trim-applied');
                });

                it('should disallow `fold`', function () {
                    testDisallowContentType('fold');
                });
            });
        });

        describe('confirm listener', function () {
            let button, listener;

            function getConfirmListener(button) {
                let listener;

                addEventListenerOnce(button, 'ez:contentDiscover', function (e) {
                    listener = e.detail.listeners['ez:confirm'];
                });
                simulateClick(button);

                return listener;
            }

            function getConfirmEvent(selection) {
                return new CustomEvent('ez:select', {
                    cancelable: true,
                    detail: {
                        selection: selection,
                    },
                });
            }

            describe('fill', function () {
                let input;

                beforeEach(function () {
                    const inputSelector = '.input-to-fill';

                    input = element.querySelector(inputSelector);
                    button = element.querySelector('.no-submit');
                    button.setAttribute('data-ud-confirm-fill', inputSelector);
                    button.setAttribute('data-ud-confirm-fill-with', 'location.id');
                    listener = getConfirmListener(button);
                });

                it('should fill input', function () {
                    const locationId = 42;
                    const selection = {'location': {'id': locationId}};
                    const confirmEvent = getConfirmEvent(selection);

                    listener(confirmEvent);

                    assert.equal(locationId, input.value);
                });

                it('should fill with several values', function () {
                    const locationIds = [42, 43, 44];
                    const selection = locationIds.map(function (locationId) {
                        return {location: {id: locationId}};
                    });

                    button.setAttribute('data-ud-multiple', true);
                    const confirmEvent = getConfirmEvent(selection);

                    listener(confirmEvent);

                    assert.equal(locationIds.toString(), input.value);
                });
            });

            describe('form', function () {
                let form;

                beforeEach(function () {
                    form = element.querySelector('form');
                    sinon.stub(form, 'submit');
                });

                it('should not submit the form', function () {
                    let submit = false;
                    const button = element.querySelector('.no-submit');

                    listener = getConfirmListener(button);

                    addEventListenerOnce(form, 'submit', function () {
                        submit = true;
                    });
                    listener(getConfirmEvent({}));

                    assert.isFalse(submit);
                    assert.isFalse(form.submit.called);
                });

                it('should dispatch the submit event', function () {
                    let submit = false;
                    const button = element.querySelector('.submit');

                    listener = getConfirmListener(button);

                    addEventListenerOnce(document, 'submit', function (e) {
                        e.preventDefault();
                        submit = true;
                    });
                    listener(getConfirmEvent({}));

                    assert.isTrue(submit);
                    assert.isFalse(form.submit.called);

                });

                it('should submit the form', function () {
                    let submit = false;
                    const button = element.querySelector('.submit');

                    listener = getConfirmListener(button);

                    addEventListenerOnce(document, 'submit', function () {
                        submit = true;
                    });
                    listener(getConfirmEvent({}));

                    assert.isTrue(submit);
                    assert.isTrue(form.submit.calledOnce);
                });
            });

            describe('`ez:runUniversalDiscovery:confirm`', function () {
                it('should be dispatched', function () {
                    let confirm = true;
                    const button = element.querySelector('.no-submit');
                    const selection = {};

                    listener = getConfirmListener(button);

                    addEventListenerOnce(document, 'ez:runUniversalDiscovery:confirm', function (e) {
                        confirm = true;

                        assert.strictEqual(
                            selection, e.detail.selection,
                            'The selection should be provided in the event parameters'
                        );
                    });
                    listener(getConfirmEvent(selection));

                    assert.isTrue(confirm);
                });
            });
        });
    });
});
