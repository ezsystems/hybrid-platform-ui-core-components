describe('ez-notification', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-notification'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`type`', function () {
            it('should default to an empty string', function () {
                assert.equal('', element.type);
            });

            describe('set', function () {
                it('should be reflected to an attribute', function () {
                    element.type = 'whatever';

                    assert.equal(
                        element.type,
                        element.getAttribute('type')
                    );
                });
            });
        });

        describe('`timeout`', function () {
            it('should default to 0', function () {
                assert.equal(0, element.timeout);
            });
        });
    });

    describe('content', function () {
        let elementWithContent;

        beforeEach(function () {
            elementWithContent = fixture('WithContentTestFixture');
        });

        it('should be distributed in the default slot', function () {
            const content = elementWithContent.querySelector('.notification-content');

            assert.isNotNull(content.assignedSlot);
        });
    });

    describe('removal', function () {
        it('should be automatic after timeout second', function (done) {
            const parent = element.parentNode;

            element.timeout = 0.1;

            setTimeout(function () {
                assert.isNull(
                    parent.querySelector('ez-notification'),
                    'The notification should have been removed'
                );
                done();
            }, element.timeout * 1.5 * 1000);
        });
    });

    describe('close button', function () {
        it('should remove the notification', function () {
            const parent = element.parentNode;

            element.shadowRoot.querySelector('button').dispatchEvent(new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            }));

            assert.isNull(parent.querySelector('ez-notification'));
        });
    });
});
