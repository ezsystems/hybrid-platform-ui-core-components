describe('ez-tabs', function () {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should define the eZ.TabsMixin', function () {
        assert.isFunction(window.eZ.TabsMixin);
    });

    describe('swich tab', function () {
        let link, label, panel;

        function simulateClick(element) {
            element.dispatchEvent(new CustomEvent('click', {
                bubbles: true,
            }));
        }

        beforeEach(function () {
            link = element.querySelector('.tab-link');
            label = link.parentNode;
            panel = element.querySelector(link.getAttribute('href'));
        });

        it('should change tab', function () {
            const selected = element.querySelector('.is-tab-selected');

            simulateClick(link);

            Array.prototype.forEach.call(selected, function (el) {
                assert.isFalse(
                    el.classList.contains('is-tab-selected'),
                    'The selected element should not be selected anymore'
                );
            });
            assert.isTrue(
                label.classList.contains('is-tab-selected'),
                'A new tab should be selected'
            );
            assert.isTrue(
                panel.classList.contains('is-tab-selected'),
                'A new panel should be visible'
            );
        });

        it('should ignore click on elements other than tabs label', function () {
            const initialContent = element.innerHTML;

            simulateClick(element.querySelector('.not-tabs-label'));
            assert.equal(
                initialContent,
                element.innerHTML
            );
        });

        describe('`ez:tabChange` event', function () {
            it('should be dispatched', function () {
                let tabChangeEvent = false;

                element.addEventListener('ez:tabChange', function (e) {
                    tabChangeEvent = true;

                    assert.strictEqual(
                        label, e.detail.label,
                        'The tab label should be provided in the event detail'
                    );
                    assert.strictEqual(
                        panel, e.detail.panel,
                        'The tab panel should be provided in the event detail'
                    );
                });
                simulateClick(link);

                assert.isTrue(tabChangeEvent);
            });

            it('should bubble', function () {
                let bubble = false;
                const assertBubble = function () {
                    bubble = true;
                    document.removeEventListener('ez:tabChange', assertBubble);
                };

                document.addEventListener('ez:tabChange', assertBubble);
                simulateClick(link);
                assert.isTrue(bubble);
            });

            it('should be preventable', function () {
                element.addEventListener('ez:tabChange', function (e) {
                    e.preventDefault();
                });
                simulateClick(link);

                assert.isFalse(
                    label.classList.contains('is-tab-selected'),
                    'A new tab should not be selected'
                );
                assert.isFalse(
                    panel.classList.contains('is-tab-selected'),
                    'A new panel should not be visible'
                );
            });
        });
    });
});
