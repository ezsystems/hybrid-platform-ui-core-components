describe('ez-asynchronous-block', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-asynchronous-block'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`loading`', function () {
            it('should default to false', function () {
                assert.isFalse(element.loading);
            });

            it('should be reflected to an attribute', function () {
                element.loading = true;
                assert.isTrue(element.hasAttribute('loading'));
            });

            it('should be set to true when loading', function () {
                element.load();
                assert.isTrue(element.loading);
            });
        });

        describe('`loaded`', function () {
            it('should default to false', function () {
                assert.isFalse(element.loaded);
            });

            it('should be set after a successful loading', function (done) {
                element.addEventListener('ez:asynchronousBlock:updated', function () {
                    assert.isTrue(element.loaded);
                    done();
                });
                element.load();
            });
        });

        describe('`url`', function () {
            it('should be defined', function () {
                assert.equal(
                    element.url,
                    element.getAttribute('url')
                );
            });
        });
    });

    describe('load()', function () {
        beforeEach(function () {
            sinon.spy(window, 'fetch');
        });

        afterEach(function () {
            fetch.restore();
        });

        it('should request the `url`', function () {
            element.load();

            assert.isTrue(fetch.calledOnce);
            assert.isTrue(fetch.alwaysCalledWith(element.url));
        });

        it('should update the content', function (done) {
            element.addEventListener('ez:asynchronousBlock:updated', function () {
                assert.isNotNull(element.querySelector('.updated'));
                done();
            });
            element.load();
        });

        describe('network error handling', function () {
            function assertError(error, element) {
                // this should test instanceof Error instead
                // but in Edge with the fetch polyfill it's not an Error object!?
                assert.isDefined(
                    error,
                    'The error should be provided in the event'
                );

                assert.isFalse(
                    element.loading,
                    '`loading` should be set to false'
                );
                assert.isFalse(
                    element.loaded,
                    '`loaded` should be set to false'
                );
            }

            it('should handle connection errors', function (done) {
                element.addEventListener('ez:asynchronousBlock:error', function (e) {
                    assertError(e.detail.error, element);
                    done();
                });
                element.url = 'http://ihopeitwillneverexists.test';
                element.load();
            });

            it('should handle 40X errors', function (done) {
                element.addEventListener('ez:asynchronousBlock:error', function (e) {
                    assertError(e.detail.error, element);
                    done();
                });
                element.url = 'test/does/not/exist';
                element.load();
            });
        });

        function testBubble(element, eventName, done) {
            const assertBubble = function () {
                document.removeEventListener(eventName, assertBubble);
                done();
            };

            document.addEventListener(eventName, assertBubble);
            element.load();
        }

        describe('`ez:asynchronousBlock:updated`', function () {
            it('should bubble', function (done) {
                testBubble(element, 'ez:asynchronousBlock:updated', done);
            });
        });

        describe('`ez:asynchronousBlock:error', function () {
            it('should bubble', function (done) {
                element.url = 'http://ihopeitwillneverexists.test';
                testBubble(element, 'ez:asynchronousBlock:error', done);
            });
        });
    });
});
