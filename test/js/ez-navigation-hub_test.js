/* global describe, it, assert, fixture */
describe('ez-navigation-hub', function() {
    it('should be defined', function () {
        var element = fixture('BasicTestFixture');

        assert.equal(
            window.customElements.get('ez-navigation-hub'),
            element.constructor
        );
    });
});
