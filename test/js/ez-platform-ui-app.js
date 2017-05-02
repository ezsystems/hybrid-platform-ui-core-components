/* global describe, it, beforeEach, afterEach, assert, fixture, sinon, Promise */
describe('ez-platform-ui-app', function() {
    let element;

    const urlEmptyUpdate = '/test/responses/empty.json';
    const urlBaseUpdate = '/test/responses/set-data-updated-attr.json';
    const urlSetAttributes = '/test/responses/set-attributes.json';
    const urlStringUpdate = '/test/responses/string-update.json';
    const urlSetChildAttributes = '/test/responses/set-child-attributes.json';
    const urlFalsyChildUpdate = '/test/responses/falsy-child-update.json';
    const urlWrong = '/test/responses/wrong-selector.json';

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-platform-ui-app'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`title`', function () {
            it('should default to the document title', function () {
                assert.equal(
                    document.title,
                    element.title
                );
            });

            describe('set', function () {
                it('should update the document title', function () {
                    const newTitle = 'Silverchair - Cicada';

                    element.title = newTitle;
                    assert.equal(
                        newTitle,
                        document.title
                    );
                });

                it('should be reflected to an attribute', function () {
                    const newTitle = 'Silverchair - Freak';

                    element.title = newTitle;
                    assert.equal(
                        newTitle,
                        element.getAttribute('title')
                    );
                });
            });
        });

        describe('`url`', function () {
            it('should default to the document uri', function () {
                assert.equal(
                    location.href,
                    element.url
                );
            });

            describe('set', function () {
                it('should be reflected to an attribute', function () {
                    element.url = urlEmptyUpdate;

                    assert.equal(
                        element.url,
                        element.getAttribute('url')
                    );
                });

                it('should trigger an AJAX request', function (done) {
                    const check = function () {
                        element.removeEventListener('ez:app:updated', check);
                        assert.ok(
                            element.hasAttribute('data-updated'),
                            'The element should have been updated from the response'
                        );

                        done();
                    };

                    element.addEventListener('ez:app:updated', check);
                    element.url = urlBaseUpdate;
                });
            });
        });

        describe ('`updating`', function () {
            it('should default to false', function () {
                assert.notOk(element.updating);
            });

            describe('set', function () {
                it('should be reflected to an attribute', function () {
                    element.updating = true;

                    assert.ok(
                        element.hasAttribute('updating')
                    );
                });

                it('should be set when updating', function (done) {
                    const observer = new MutationObserver(function () {
                        assert.ok(element.updating);
                        observer.disconnect();
                        done();
                    });

                    observer.observe(element, {
                        attributes: true,
                        attributeFilter: ['updating'],
                    });
                    element.url = urlEmptyUpdate;
                });

                it('should be unset after the update', function (done) {
                    element.addEventListener('ez:app:updated', function () {
                        assert.notOk(element.updating);
                        done();
                    });
                    element.url = urlEmptyUpdate;
                });
            });
        });
    });

    describe('enhance navigation', function () {
        function simulateClick(element) {
            const click = new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            });

            element.dispatchEvent(click);
            return click;
        }

        function assertEventIgnored(event, element, expectedUrl) {
            assert.notOk(
                event.defaultPrevented,
                'The event should not be prevented'
            );
            assert.equal(
                expectedUrl,
                element.url,
                'The `url` property should remain to its default value'
            );
        }

        function assertEventHandled(event, link, element) {
            assert.ok(
                event.defaultPrevented,
                'The event should have been prevented'
            );
            assert.equal(
                link.href,
                element.url,
                'The `url` attribute should be updated with the link `href`'
            );
        }

        it('should handle click on regular link', function () {
            const link = element.querySelector('.enhanced-link');
            const event = simulateClick(link);

            assertEventHandled(event, link, element);
        });

        it('should handle click on element inside a regular link', function () {
            const link = element.querySelector('.enhanced-link');
            const inside = link.querySelector('.deep-inside-link');
            const event = simulateClick(inside);

            assertEventHandled(event, link, element);
        });

        it('should ignore click `<a>` without `href`', function () {
            const anchor = element.querySelector('.no-href');
            const initialUrl = element.url;
            const event = simulateClick(anchor);

            assertEventIgnored(event, element, initialUrl);
        });

        it('should ignore click others element than links', function () {
            const button = element.querySelector('.not-a-link');
            const initialUrl = element.url;
            const event = simulateClick(button);

            assertEventIgnored(event, element, initialUrl);
        });

        it('should ignore click on anchor `<a>`', function () {
            // this test is ignored because Edge (at least 14) has a weird
            // behaviour. It seems that clicking on <a href="#test"></a>
            // triggers a popstate event (like if the user uses the back button)
            // which is of course not the right behavior. But this seems to
            // happen only in unit test, this behavior does not seem to occur in
            // a normal web page...
            if ( navigator.userAgent.match(/Edge/) ) {
                this.skip();
            }
            const anchor = element.querySelector('.anchor');
            const initialUrl = element.url;
            const event = simulateClick(anchor);

            assertEventIgnored(event, element, initialUrl);
        });
    });

    describe('`ez:app:updated` event', function () {
        it('should bubble`', function (done) {
            const assertOnce = function (e) {
                document.documentElement.removeEventListener('ez:app:updated', assertOnce);
                assert.strictEqual(
                    element,
                    e.target,
                    'The event target should be the `ez-platform-ui-app` element'
                );
                done();
            };

            document.documentElement.addEventListener('ez:app:updated', assertOnce);
            element.url = urlEmptyUpdate;
        });
    });

    describe('history', function () {
        it('should push an history entry', function (done) {
            element.addEventListener('ez:app:updated', function () {
                assert.equal(
                    urlEmptyUpdate,
                    history.state.url
                );
                assert.ok(
                    history.state.enhanced,
                    'The state should have the `enhanced` property set to true'
                );

                done();
            });
            element.url = urlEmptyUpdate;
        });

        it('should reuse the last history entry', function (done) {
            const backRequest = function () {
                element.removeEventListener('ez:app:updated', backRequest);
                history.back();
                element.addEventListener('ez:app:updated', function () {
                    assert.equal(
                        element.url,
                        urlEmptyUpdate
                    );
                    assert.equal(
                        history.state.url,
                        urlEmptyUpdate,
                        'No new history should have been created'
                    );
                    done();
                });
            };
            const secondRequest = function () {
                element.removeEventListener('ez:app:updated', secondRequest);
                element.url = urlEmptyUpdate + '?second';
                element.addEventListener('ez:app:updated', backRequest);
            };

            element.addEventListener('ez:app:updated', secondRequest);
            element.url = urlEmptyUpdate;
        });
    });

    describe('AJAX update', function () {
        describe('request', function () {
            beforeEach(function () {
                const response = new Response('{}');

                this.fetch = sinon.stub(window, 'fetch', function () {
                    return Promise.resolve(response);
                });

                element.url = '/whatever';
            });

            afterEach(function () {
                this.fetch.restore();
            });

            it('should request the url', function () {
                assert.equal(
                    element.url,
                    this.fetch.firstCall.args[0]
                );
            });

            it('should have the X-AJAX-Update header', function () {
                const headers = this.fetch.firstCall.args[1].headers;

                assert.equal(
                    '1',
                    headers.get('X-AJAX-Update')
                );
            });
        });

        it('should be able to set attributes', function (done) {
            element.addEventListener('ez:app:updated', function () {
                assert.equal(
                    'foo',
                    element.getAttribute('data-foo'),
                    'The `data-foo` attribute should have been set'
                );
                assert.equal(
                    'bar',
                    element.getAttribute('data-bar'),
                    'The `data-foo` attribute should have been set'
                );
                done();
            });
            element.url = urlSetAttributes;
        });

        it('should be able to apply a string update to a child', function (done) {
            element.addEventListener('ez:app:updated', function () {
                assert.equal(
                    'updated',
                    element.querySelector('main').innerHTML
                );
                done();
            });
            element.url = urlStringUpdate;
        });

        it('should be able to set attributes on a child', function (done) {
            element.addEventListener('ez:app:updated', function () {
                const updated = element.querySelector('nav');

                assert.equal(
                    'foo',
                    updated.getAttribute('data-foo'),
                    'The `data-foo` attribute should have been set'
                );
                assert.equal(
                    'bar',
                    updated.getAttribute('data-bar'),
                    'The `data-bar` attribute should have been set'
                );
                done();
            });
            element.url = urlSetChildAttributes;
        });

        it('should handle a falsy child update', function (done) {
            const initialContent = element.innerHTML;

            element.addEventListener('ez:app:updated', function () {
                assert.equal(
                    initialContent,
                    element.innerHTML
                );
                done();
            });
            element.url = urlFalsyChildUpdate;
        });

        it('should handle a wrong selector', function (done) {
            const warn = sinon.spy(console, 'warn');

            element.addEventListener('ez:app:updated', function () {
                assert.isNull(
                    element.querySelector('[data-wrong]'),
                    'There should have been no update'
                );
                assert.ok(
                    warn.called,
                    '`console.warn` should have been called'
                );
                warn.restore();
                done();
            });

            element.url = urlWrong;
        });
    });
});
