describe('ez-tabs', function () {
    let element;

    it('should define `eZ.mixins.Tabs`', function () {
        assert.isFunction(window.eZ.mixins.Tabs);
    });

    function simulateClick(element) {
        element.dispatchEvent(new CustomEvent('click', {
            bubbles: true,
        }));
    }

    describe('switch tab', function () {
        let link, label, panel;

        element = fixture('BasicTestFixture');

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

    describe('switch tab in a correct container', function () {
        let link, label, panel;

        const CLASS_TAB_SELECTED = 'is-tab-selected';
        const SELECTOR_TAB_SELECTED = '.is-tab-selected';

        element = fixture('AdvancedTestFixture');

        beforeEach(function () {
            link = element.querySelector('#clickable-link');
            label = link.parentNode;
            panel = element.querySelector(link.getAttribute('href'));
        });

        it('should change tab in a correct tabs container', function () {
            const tabContainers = [].slice.call(element.querySelectorAll('.ez-tabs'));
            const selectedTabs = [].slice.call(element.querySelectorAll(SELECTOR_TAB_SELECTED));
            const selectedTab = element.querySelector('#test-tab');
            const selectedPanel = element.querySelector('#tab1');

            simulateClick(link);

            tabContainers.forEach(function (container) {
                assert.length(container.querySelectorAll(SELECTOR_TAB_SELECTED), 1, 'The tabs container should contain one tab selected');
            });

            assert.isFalse(selectedTab.classList.contains(CLASS_TAB_SELECTED), 'Previously selected tab should be unselected');
            assert.isFalse(selectedPanel.classList.contains(CLASS_TAB_SELECTED), 'Previously selected panel should not be visible');

            assert.isTrue(label.classList.contains(CLASS_TAB_SELECTED), 'A new tab should be selected');
            assert.isTrue(panel.classList.contains(CLASS_TAB_SELECTED), 'A new panel should be visible');
        });
    });
});
