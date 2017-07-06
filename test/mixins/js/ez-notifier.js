describe('ez-notifier', function () {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should define `eZ.mixins.notifier`', function () {
        assert.isFunction(window.eZ.mixins.Notifier);
    });

    describe('notify()', function () {
        describe('`ez:notify` event', function () {
            const notification = {};

            it('should be dispatched', function () {
                let dispatched = false;

                element.addEventListener('ez:notify', function (e) {
                    dispatched = true;
                    assert.strictEqual(
                        e.detail.notification,
                        notification,
                        'The event detail should contain the notification'
                    );
                });
                element.notify(notification);

                assert.isTrue(dispatched);
            });

            it('should bubble', function () {
                let bubble = false;
                const assertBubble = function () {
                    document.removeEventListener('ez:notify', assertBubble);
                    bubble = true;
                };

                document.addEventListener('ez:notify', assertBubble);
                element.notify(notification);
                assert.isTrue(bubble);
            });
        });
    });
});
