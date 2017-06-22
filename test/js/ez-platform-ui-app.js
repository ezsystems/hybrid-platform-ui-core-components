describe('ez-platform-ui-app', function() {
    let element;

    const urlEmptyUpdate = '/test/responses/empty.json';
    const urlBaseUpdate = '/test/responses/set-data-updated-attr.json';
    const urlSetAttributes = '/test/responses/set-attributes.json';
    const urlSetProperties = '/test/responses/set-properties.json';
    const urlStringUpdate = '/test/responses/string-update.json';
    const urlSetChildAttributes = '/test/responses/set-child-attributes.json';
    const urlSetChildProperties = '/test/responses/set-child-properties.json';
    const urlFalsyChildUpdate = '/test/responses/falsy-child-update.json';
    const urlWrong = '/test/responses/wrong-selector.json';
    const urlInvalidJson = '/test/responses/invalid.json';

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
        describe('`pageTitle`', function () {
            it('should default to the document title', function () {
                assert.equal(
                    document.title,
                    element.pageTitle
                );
            });

            describe('set', function () {
                it('should update the document title', function () {
                    const newTitle = 'Silverchair - Cicada';

                    element.pageTitle = newTitle;
                    assert.equal(
                        newTitle,
                        document.title
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

                it('should set `updating` and unset it', function (done) {
                    const check = function () {
                        element.removeEventListener('ez:app:updated', check);
                        assert.isFalse(
                            element.updating,
                            '`updating` should have been set back to false'
                        );
                        done();
                    };

                    element.addEventListener('ez:app:updated', check);
                    element.url = urlBaseUpdate;
                    assert.isTrue(
                        element.updating,
                        '`updating` should be true'
                    );
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

                it('should prevent further update while true', function (done) {
                    const check = function () {
                        element.removeEventListener(check);
                        assert.fail('The app should not have been updated');
                        done();
                    };

                    element.updating = true;
                    element.addEventListener('ez:app:updated', check);
                    element.url = urlBaseUpdate;
                    setTimeout(done, 100);
                });
            });
        });

        describe('`notifications`', function () {
            let notifElement;

            beforeEach(function () {
                notifElement = fixture('NotificationsTestFixture');
            });

            function assertNotification(object, element) {
                Object.keys(object).forEach(function (prop) {
                    if ( prop === 'content' ) {
                        assert.strictEqual(
                            object[prop], element.innerHTML,
                            'The ez-notification content should have been set from the notification object'
                        );
                    } else {
                        assert.strictEqual(
                            object[prop], element[prop],
                            `The ez-notification property '${prop}' should have been set from the object`
                        );
                    }
                });
            }

            it('should ignore falsy value', function () {
                element.notifications = '';
            });

            it('should render notifications', function () {
                const notification1 = {
                    type: 'error',
                    timeout: 0,
                    content: 'whatever',
                    copyable: true,
                    details: 'whatever2',
                };
                const notification2 = {
                    type: 'success',
                    timeout: 10,
                    content: '2',
                    copyable: false,
                    details: 'details 2',
                };

                notifElement.notifications = [notification1, notification2];

                const elements = notifElement.querySelectorAll('ez-notification');

                assert.equal(
                    notifElement.notifications.length, elements.length,
                    `${notifElement.notifications.length} notifications should have been created`
                );
                assertNotification(notification1, elements[0]);
                assertNotification(notification2, elements[1]);
            });

            it('should convert notification `timeout` to a number', function () {
                const notification = {
                    type: 'error',
                    timeout: '0',
                    content: 'whatever',
                };

                notifElement.notifications = [notification];
                assert.strictEqual(0, notifElement.querySelector('ez-notification').timeout);
            });

            it('should convert notification `copyable` to a boolean', function () {
                const notification = {
                    type: 'error',
                    timeout: '0',
                    content: 'whatever',
                    copyable: 'true',
                };

                notifElement.notifications = [notification];
                assert.isTrue(notifElement.querySelector('ez-notification').copyable);
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

        function prevent(e) {
            e.preventDefault();
        }

        describe('navigation', function () {
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

            describe('opt out', function () {
                beforeEach(function () {
                    document.addEventListener('click', prevent);
                });

                afterEach(function () {
                    document.removeEventListener('click', prevent);
                });

                function testIgnoredLink(selector) {
                    const link = element.querySelector(selector);

                    element.addEventListener('click', function (e) {
                        assert.isFalse(
                            e.defaultPrevented,
                            'The click event should not be prevented'
                        );
                    });
                    simulateClick(link);

                    assert.notEqual(
                        link.href,
                        element.url,
                        'The app should not navigate the link url'
                    );
                }

                it('should ignore click on links having the ez-js-standard-navigation class', function () {
                    testIgnoredLink('a.ez-js-standard-navigation');
                });

                it('should ignore click on links having an ancestor with the ez-js-standard-navigation class', function () {
                    testIgnoredLink('.ez-js-standard-navigation a');
                });
            });
        });

        describe('form', function () {
            function submitForm(form) {
                return form.dispatchEvent(new CustomEvent('submit', {
                    bubbles: true,
                    cancelable: true,
                }));
            }

            beforeEach(function () {
                element.addEventListener('click', function (e) {
                    // in Edge and Safari, simulating a click on the button
                    // triggers the form submit while that's not the case in
                    // Firefox nor Chrome. So this event handler is there to
                    // prevent this behavior in Edge and Safari, so that the
                    // form submit happens because of `submitForm` call.
                    e.preventDefault();
                });
            });

            describe('opt out', function () {
                beforeEach(function () {
                    document.addEventListener('submit', prevent);
                });

                afterEach(function () {
                    document.removeEventListener('submit', prevent);
                });

                function testIgnoredForm(selector) {
                    const form = element.querySelector(selector);

                    element.addEventListener('submit', function (e) {
                        assert.isFalse(
                            e.defaultPrevented,
                            'The submit event should not have been prevented'
                        );
                    });
                    submitForm(form);
                    assert.notEqual(
                        element.url,
                        form.action,
                        'The submit should have been ignored by the app'
                    );
                }

                it('should ignore form having ez-js-standard-form class', function () {
                    testIgnoredForm('form.ez-js-standard-form');
                });

                it('should ignore form with an ancestor having ez-js-standard-form class', function () {
                    testIgnoredForm('div.ez-js-standard-form form');
                });
            });

            describe('post', function () {
                let fetch;
                let formDataAppend;
                let historyReplace;

                beforeEach(function () {
                    const FormDataOriginal = window.FormData;
                    const response = new Response('{}');

                    // https://github.com/Polymer/polyserve/issues/197
                    // Web Component Tester internal server does not support POST
                    // request, we are forced to stub `fetch` to simulate a POST
                    // request.
                    fetch = sinon.stub(window, 'fetch', function () {
                        return Promise.resolve(response);
                    });
                    sinon.stub(window, 'FormData', (form) => {
                        const fd = new FormDataOriginal(form);

                        formDataAppend = sinon.spy(fd, 'append');

                        return fd;
                    });
                    historyReplace = sinon.spy(history, 'replaceState');
                });

                afterEach(function () {
                    fetch.restore();
                    formDataAppend.restore();
                    FormData.restore();
                    historyReplace.restore();
                });

                it('should submit form in AJAX', function () {
                    const form = element.querySelector('form[method="post"]');
                    const kept = submitForm(form);
                    const headers = fetch.firstCall.args[1].headers;

                    assert.isFalse(
                        kept,
                        'The `submit` event should have been prevented'
                    );
                    assert.isTrue(
                        fetch.calledOnce,
                        'An AJAX request should have been triggered'
                    );
                    assert.equal(
                        '1',
                        headers.get('X-AJAX-Update')
                    );
                });

                it('should build the request based on the form', function () {
                    const form = element.querySelector('form[method="post"]');

                    submitForm(form);
                    const fetchArgs = fetch.firstCall.args;

                    assert.equal(
                        form.action,
                        fetchArgs[0],
                        'The form action URL should have been requested'
                    );
                    assert.equal(
                        form.method,
                        fetchArgs[1].method,
                        'The form method should be the request method'
                    );
                    assert.strictEqual(
                        FormData.firstCall.args[0],
                        form
                    );
                });

                function testSubmitWithClick(form, button) {
                    simulateClick(button);
                    submitForm(form);
                    const appendArgs = formDataAppend.firstCall.args;

                    assert.equal(
                        button.name,
                        appendArgs[0]
                    );
                    assert.equal(
                        button.value,
                        appendArgs[1]
                    );
                }

                it('should add the clicked button to the form data', function () {
                    const form = element.querySelector('form[method="post"]');

                    testSubmitWithClick.call(this, form, form.querySelector('button'));
                });

                it('should add the clicked submit input to the form data', function () {
                    const form = element.querySelector('form[method="post"]');

                    testSubmitWithClick.call(this, form, form.querySelector('input[type="submit"]'));
                });

                it('should add the clicked image input to the form data', function () {
                    const form = element.querySelector('form[method="post"]');

                    testSubmitWithClick.call(this, form, form.querySelector('input[type="image"]'));
                });

                it('should update the History', function (done) {
                    const initialState = history.state;
                    const form = element.querySelector('form[method="post"]');
                    const check = function () {
                        element.removeEventListener('ez:app:updated', check);
                        assert.notStrictEqual(
                            initialState, history.state,
                            'The history state should have been changed'
                        );
                        assert.isTrue(
                            history.state.enhanced,
                            'The history state should be `enhanced`'
                        );
                        assert.isTrue(
                            historyReplace.called,
                            'The state should have been replaced'
                        );
                        done();
                    };

                    element.addEventListener('ez:app:updated', check);
                    submitForm(form);
                });
            });

            describe('get', function () {
                const expectedUrl = '/test/responses/set-data-updated-attr.json?radio=radio&checked=checked&checked-no-value=on&select-one=option&select-multiple=option2&simple=simple&';

                it('should navigate to the corresponding URL', function (done) {
                    const form = element.querySelector('form[method="get"]');
                    const check = function () {
                        element.removeEventListener('ez:app:updated', check);
                        assert.ok(element.url.endsWith(expectedUrl));
                        done();
                    };

                    element.addEventListener('ez:app:updated', check);
                    submitForm(form);
                });

                it('should navigate to the corresponding URL when submitted with a button', function (done) {
                    const form = element.querySelector('form[method="get"]');
                    const button = form.querySelector('button');
                    const check = function () {
                        element.removeEventListener('ez:app:updated', check);
                        assert.ok(element.url.endsWith(expectedUrl + 'submit=&'));
                        done();
                    };

                    element.addEventListener('ez:app:updated', check);
                    simulateClick(button);
                    submitForm(form);
                });
            });
        });

        describe('error handling', function () {
            it('should handle a JSON decode error', function (done) {
                const observer = new MutationObserver(function () {
                    assert.isFalse(
                        element.updating,
                        '`updating` should have been set back to false`'
                    );
                    observer.disconnect();
                    done();
                });

                element.url = urlInvalidJson;
                observer.observe(element, {
                    attributes: true,
                    attributeFilter: ['updating'],
                });
            });
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

        it('should contain the update response`', function (done) {
            const assertOnce = function (e) {
                document.documentElement.removeEventListener('ez:app:updated', assertOnce);
                assert.instanceOf(
                    e.detail.response,
                    Response
                );
                assert.isTrue(
                    e.detail.response.url.endsWith(urlEmptyUpdate),
                    'The response URL should be the one used by the update'
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
            const assertBack = function () {
                window.removeEventListener('popstate', assertBack);

                assert.equal(
                    element.url,
                    urlEmptyUpdate
                );
                done();
            };
            const back = function () {
                element.removeEventListener('ez:app:updated', back);
                window.addEventListener('popstate', assertBack);
                history.back();
            };

            history.pushState({
                url: urlEmptyUpdate,
                enhanced: true,
            }, '', urlEmptyUpdate);

            element.addEventListener('ez:app:updated', back);
            element.url = urlEmptyUpdate + '?second';
        });
    });

    describe('AJAX update', function () {
        describe('request', function () {
            function mockFetchResponse() {
                const response = new Response('{}');

                this.fetch = sinon.stub(window, 'fetch', function () {
                    return Promise.resolve(response);
                });

                element.url = this.initialUrl;
            }

            function mockFetchResponseRedirect() {
                const response = {
                    url: this.redirectUrl,
                    json: function () {
                        return {};
                    },
                };

                this.fetch = sinon.stub(window, 'fetch', function () {
                    return Promise.resolve(response);
                });

                element.url = this.initialUrl;
            }

            beforeEach(function () {
                this.initialUrl = '/whatever';
                this.redirectUrl = '/redirected';
            });

            afterEach(function () {
                this.fetch.restore();
            });

            it('should request the url', function () {
                mockFetchResponse.apply(this);
                assert.equal(
                    element.url,
                    this.fetch.firstCall.args[0]
                );
            });

            it('should have the X-AJAX-Update header', function () {
                mockFetchResponse.apply(this);
                const headers = this.fetch.firstCall.args[1].headers;

                assert.equal(
                    '1',
                    headers.get('X-AJAX-Update')
                );
            });

            it('should handle redirect', function (done) {
                mockFetchResponseRedirect.apply(this);

                element.addEventListener('ez:app:updated', () => {
                    assert.equal(
                        this.redirectUrl,
                        element.url
                    );
                    done();
                });
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

        it('should be able to set properties', function (done) {
            element.addEventListener('ez:app:updated', function () {
                assert.equal(
                    'updated title',
                    element.pageTitle,
                    'The `title` property should have been set'
                );
                assert.equal(
                    'updated lang',
                    element.lang,
                    'The `lang` property should have been set'
                );

                done();
            });
            element.url = urlSetProperties;
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

        it('should be able to set properties on a child', function (done) {
            element.addEventListener('ez:app:updated', function () {
                const updated = element.querySelector('nav');

                assert.equal(
                    'updated content',
                    updated.innerHTML,
                    'The `innerHTML` property should have been updated'
                );
                assert.equal(
                    'updated title',
                    updated.pageTitle,
                    'The `title` property should have been updated'
                );
                done();
            });
            element.url = urlSetChildProperties;
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
