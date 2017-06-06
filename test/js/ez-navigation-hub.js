describe('ez-navigation-hub', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        const element = fixture('BasicTestFixture');

        assert.equal(
            window.customElements.get('ez-navigation-hub'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`activeZoneClass`', function () {
            it('should have a default value', function () {
                assert.equal(element.activeZoneClass, 'ez-active-zone');
            });

            it('should be set by the attribute', function () {
                const value = 'Something';

                element.setAttribute('active-zone-class', value);
                assert.equal(element.activeZoneClass, value);
            });
        });

        describe('`matchedLinkClass`', function () {
            it('should have a default value', function () {
                assert.equal(element.matchedLinkClass, 'ez-matched-link');
            });

            it('should be set by the attribute', function () {
                const value = 'Something';

                element.setAttribute('matched-link-class', value);
                assert.equal(element.matchedLinkClass, value);
            });
        });

        describe('`activeZone`', function () {
            it('should default to undefined', function () {
                assert.isUndefined(element.activeZone);
            });

            it('should be set by the attribute', function () {
                const value = 'contents';

                element.setAttribute('active-zone', value);
                assert.equal(element.activeZone, value);
            });
        });

        describe('`matchedLinkUrl`', function () {
            it('should default to undefined', function () {
                assert.isUndefined(element.matchedLinkUrl);
            });

            it('should be set by the attribute', function () {
                const value = 'url1';

                element.setAttribute('matched-link-url', value);
                assert.equal(element.matchedLinkUrl, value);
            });
        });
    });

    describe('active zone update', function () {
        let emptyElement;

        function simulateClick(element) {
            const click = new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
            });

            element.dispatchEvent(click);
            return click;
        }
        function assertEventHandled(event) {
            assert.ok(
                event.defaultPrevented,
                'The event should have been prevented'
            );
        }

        beforeEach(function () {
            emptyElement = fixture('EmptyElement');
        });

        it('should handle an empty navigation hub', function () {
            emptyElement.activeZone = 'whatever';
        });

        describe('highlight zone', function () {
            it('should highlight the selected zone', function () {
                const zone = element.querySelector('[data-zone-identifier="contents"]');
                const link = zone.querySelector('a');
                const event = simulateClick(link);

                assertEventHandled(event);
                assert.isOk(zone.classList.contains(element.activeZoneClass));
            });

            it('should switch zone highlight', function () {
                const contentsZone = element.querySelector('[data-zone-identifier="contents"]');
                const otherZone = element.querySelector('[data-zone-identifier="other"]');
                const link = otherZone.querySelector('a');

                element.activeZone = 'contents';
                const event = simulateClick(link);

                assertEventHandled(event);

                assert.isNotOk(contentsZone.classList.contains(element.activeZoneClass), 'zone `contents` should not be highlighted');
                assert.isOk(otherZone.classList.contains(element.activeZoneClass), 'zone `other` should be highlighted');
            });
        });

        describe('update navigation', function () {
            it('should display links belonging to the active zone', function () {
                const link = element.querySelector('[data-zone-identifier="contents"] a');
                const event = simulateClick(link);

                assertEventHandled(event);
                assert.isNotOk(element.querySelector('[data-zone="other"]').classList.contains('is-in-active-zone'), 'zone `other` links should not be displayed');
                assert.isOk(element.querySelector('[data-zone="contents"]').classList.contains('is-in-active-zone'), 'zone `contents` links should be displayed');
            });

            it('should switch links displayed', function () {
                const link = element.querySelector('[data-zone-identifier="other"] a');
                const event = simulateClick(link);

                assertEventHandled(event);
                assert.isNotOk(element.querySelector('[data-zone="contents"]').classList.contains('is-in-active-zone'), 'zone `content` links should not be displayed');
                assert.isOk(element.querySelector('[data-zone="other"]').classList.contains('is-in-active-zone'), 'zone `other` links should be displayed');
            });
        });
    });

    describe('match link url', function () {
        let emptyElement;

        beforeEach(function () {
            emptyElement = fixture('EmptyElement');
        });

        it('should handle an empty navigation hub', function () {
            emptyElement.matchedLinkUrl = 'whatever';
        });

        it('should highlight the selected link', function () {
            element.matchedLinkUrl = 'url1';
            assert.isOk(element.querySelector('[href="url1"]').parentNode.classList.contains(element.matchedLinkClass), 'link1 should be highlighted');
        });

        it('should switch the highlighted link', function () {
            element.matchedLinkUrl = 'url1';
            element.matchedLinkUrl = 'url2';
            assert.isNotOk(element.querySelector('[href="url1"]').parentNode.classList.contains(element.matchedLinkClass), 'link1 should not be highlighted anymore');
            assert.isOk(element.querySelector('[href="url2"]').parentNode.classList.contains(element.matchedLinkClass), 'link2 should be highlighted');
        });
    });
});
