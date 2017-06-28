describe('ez-browse', function() {
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
            window.customElements.get('ez-browse'),
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
                    assert.equal(e.detail.config.title, 'Browse', 'A title should be provided');
                    assert.equal(e.detail.config.startingLocationId, element.selectedLocationId, 'A startingLocationId should be provided');
                    assert.equal(e.detail.config.confirmLabel, 'View this content', 'A confirmLabel should be provided');
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
        it('should dispatch `ez:navigateTo` event', function () {
            const url = 'u/r/l/42/43';
            const confirmFakeEventFacade = {
                detail: {
                    selection: {
                        location: {
                            url: url,
                        },
                    },
                },
            };
            let eventDispatched = false;

            element.addEventListener('ez:contentDiscover', (e) => {
                e.detail.listeners['ez:confirm'](confirmFakeEventFacade);
            });

            element.addEventListener('ez:navigateTo', (e) => {
                eventDispatched =  true;
                assert.equal(e.detail.url, url, 'The url should be provided');
            });
            simulateClick(element);
            assert.isTrue(eventDispatched, 'the `navigateTo` event should be dispatched');
        });
    });
});
