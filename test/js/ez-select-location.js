describe('ez-select-location', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    function simulateClick(element) {
        const click = new CustomEvent('click', {
            bubbles: true,
            cancelable: true,
        });

        element.dispatchEvent(click);
        return click;
    }

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-select-location'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`selectedLocationId`', function () {
            it('should be set by the attribute', function () {
                assert.strictEqual(element.selectedLocationId, 42);
            });
        });
    });

    describe('click', function () {
        describe('`ez:contentDiscover` event', function () {
            it('should be dispatched', function () {
                let eventDispatched = false;

                element.addEventListener('ez:contentDiscover', (e) => {
                    eventDispatched =  true;
                    assert.equal(e.detail.config.title, 'Select a location', 'A title should be provided');
                    assert.equal(e.detail.config.startingLocationId, element.selectedLocationId, 'A startingLocationId should be provided');
                    assert.equal(e.detail.config.confirmLabel, 'Select this location', 'A confirmLabel should be provided');
                    assert.isFunction(e.detail.listeners['ez:confirm'], 'An `ez:confirm` event listener should be provided');
                });
                simulateClick(element);
                assert.isTrue(eventDispatched, 'the `ez:contentDiscover` event should be dispatched');
            });

            it('should bubble', function () {
                let eventDispatched = false;

                document.addEventListener('ez:contentDiscover', () => {
                    eventDispatched =  true;
                });
                simulateClick(element);
                assert.isTrue(eventDispatched);
            });
        });
    });

    describe('`ez:confirm` listener', function () {
        it('should dispatch `ez:locationSelected` event', function () {
            const id = 42;
            const confirmFakeEventFacade = {
                detail: {
                    selection: {
                        location: {
                            id: id,
                        },
                    },
                },
            };
            let eventDispatched = false;

            element.addEventListener('ez:contentDiscover', (e) => {
                e.detail.listeners['ez:confirm'](confirmFakeEventFacade);
            });

            element.addEventListener('ez:locationSelected', (e) => {
                eventDispatched =  true;
                assert.equal(e.detail.locationId, id, 'The location id should be provided');
            });
            simulateClick(element);
            assert.isTrue(eventDispatched, 'the `locationSelected` event should be dispatched');
        });
    });
});
