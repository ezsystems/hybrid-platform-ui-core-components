describe('ez-content-view', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-content-view'),
            element.constructor
        );
    });

    describe('asynchronous tab', function () {
        let panel;

        beforeEach(function () {
            panel = element.querySelector('ez-asynchronous-block');
            sinon.stub(panel, 'load', function () {});
        });

        afterEach(function () {
            panel.load.restore();
        });

        function changeTab(element) {
            element.querySelector('.async-tab-link').dispatchEvent(new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            }));
        }

        it('should load the tab', function () {
            changeTab(element);
            assert.isTrue(panel.load.calledOnce);
        });

        it('should not reload a loaded tab', function () {
            panel.loaded = true;
            changeTab(element);
            assert.isFalse(panel.load.called);
        });

        it('should notify loading error', function () {
            const errorEvent = new CustomEvent('ez:asynchronousBlock:error', {
                bubbles: true,
            });
            let notification = false;

            sinon.spy(errorEvent, 'stopPropagation');

            element.addEventListener('ez:notify', function (e) {
                notification = true;

                assert.equal(
                    e.detail.notification.type, 'error',
                    'An error notifcation should have been generated'
                );
            });
            panel.dispatchEvent(errorEvent);

            assert.isTrue(notification);
            assert.isTrue(
                errorEvent.stopPropagation.called,
                'The event should have been stopped'
            );
        });
    });
});
