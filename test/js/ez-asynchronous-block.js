describe('ez-asynchronous-block', function() {
    let element, elementForm;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
        elementForm = fixture('FormTestFixture');
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

    describe('form handling', function () {
        const responseContent = '<p>AJAX posted</p>';

        beforeEach(function () {
            const response = new Response(responseContent);

            // https://github.com/Polymer/polyserve/issues/197
            // Web Component Tester internal server does not support POST
            // request, we are forced to stub `fetch` to simulate a POST
            // request.
            sinon.stub(window, 'fetch', function () {
                return Promise.resolve(response);
            });
        });

        afterEach(function () {
            fetch.restore();
        });

        it('should prevent and stop submit event', function () {
            const submit = new CustomEvent('submit', {
                bubbles: true,
                cancelable: true,
            });

            sinon.spy(submit, 'stopPropagation');
            elementForm.querySelector('form').dispatchEvent(submit);

            assert.isTrue(submit.defaultPrevented);
            assert.isTrue(submit.stopPropagation.called);
        });

        it('should post forms in AJAX', function (done) {
            const form = elementForm.querySelector('form');
            const assertAjax = function () {
                elementForm.removeEventListener('ez:asynchronousBlock:updated', assertAjax);

                assert.isTrue(fetch.called);
                assert.isTrue(
                    fetch.calledWith(form.action),
                    'The fetched URI should be the form action'
                );
                assert.equal(
                    fetch.args[0][1].method,
                    form.method,
                    'The request method should be the one indicated by the form'
                );
                assert.equal(
                    elementForm.innerHTML, responseContent
                );
                assert.isTrue(
                    elementForm.loaded,
                    '`loaded` should be set to true'
                );
                done();
            };

            elementForm.addEventListener('ez:asynchronousBlock:updated', assertAjax);
            form.dispatchEvent(new CustomEvent('submit', {
                bubbles: true,
                cancelable: true,
            }));
        });
    });
});
