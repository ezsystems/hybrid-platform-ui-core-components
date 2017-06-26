describe('ez-server-side-content', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-server-side-content'),
            element.constructor
        );
    });
});
