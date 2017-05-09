describe('ez-toolbar', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-toolbar'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`visible`', function () {
            it('should default to false', function () {
                assert.notOk(element.visible);
            });

            describe('set', function () {
                it('should be reflected to an attribute', function () {
                    element.visible = true;

                    assert.isTrue(
                        element.hasAttribute('visible')
                    );
                });
            });
        });
    });

    describe('visibility', function () {
        it('should get visible', function () {
            element.visible = true;
            assert.equal(
                window.getComputedStyle(element, null).display,
                'block'
            );
        });

        it('should get hidden', function () {
            element.visible = false;
            assert.equal(
                window.getComputedStyle(element, null).display,
                'none'
            );
        });
    });
});
