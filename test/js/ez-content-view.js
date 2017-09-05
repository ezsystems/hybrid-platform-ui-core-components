describe('ez-content-view', function() {
    let element, elementSubitem;

    before(function () {
        customElements.define('ez-subitem', class extends HTMLElement {
            refresh() {}
        });
    });

    beforeEach(function () {
        element = fixture('BasicTestFixture');
        elementSubitem = fixture('RefreshSubitemTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-content-view'),
            element.constructor
        );
    });

    describe('refresh subitem', function () {
        let refreshed;

        beforeEach(function () {
            refreshed = false;
            stub('ez-subitem', {
                refresh: function () {
                    refreshed = true;
                },
            });
        });

        function dispatchUpdated(element, source) {
            element.dispatchEvent(new CustomEvent('ez:asynchronousBlock:updated', {
                bubbles: true,
                detail: {
                    source: source,
                },
            }));
        }

        it('should refresh subitem after default ordering change', function () {
            dispatchUpdated(elementSubitem, elementSubitem.querySelector('form'));

            assert.isTrue(refreshed);
        });

        it('should handle missing subitem', function () {
            elementSubitem.querySelector('ez-subitem').remove();
            dispatchUpdated(elementSubitem, elementSubitem.querySelector('form'));

            assert.isFalse(refreshed);
        });

        it('should ignore other asynchronous block update', function () {
            dispatchUpdated(elementSubitem, '/whatever/url');

            assert.isFalse(refreshed);
        });

        it('should ignore other asynchronous block form', function () {
            const form = elementSubitem.querySelector('form');

            form.name = 'not ordering';
            dispatchUpdated(elementSubitem, form);

            assert.isFalse(refreshed);
        });
    });
});
