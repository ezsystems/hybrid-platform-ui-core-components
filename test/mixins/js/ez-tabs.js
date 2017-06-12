describe('ez-tabs', function () {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should define the eZ.TabsMixin', function () {
        assert.isFunction(window.eZ.TabsMixin);
    });

    describe('swich tab', function () {
        function simulateClick(element) {
            element.dispatchEvent(new CustomEvent('click', {
                bubbles: true,
            }));
        }

        it('should change tab', function () {
            const label = element.querySelector('.tab-label');
            const selected = element.querySelector('.is-tab-selected');

            simulateClick(label);

            Array.prototype.forEach.call(selected, function (el) {
                assert.isFalse(
                    el.classList.contains('is-tab-selected'),
                    'The selected element should not be selected anymore'
                );
            });
            assert.isTrue(
                label.parentNode.classList.contains('is-tab-selected'),
                'A new tab should be selected'
            );
            assert.isTrue(
                element.querySelector(label.getAttribute('href')).classList.contains('is-tab-selected'),
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
    });
});
