/* global describe, it, assert, fixture */
describe('ez-navigation-hub', function() {
    it('should be defined', function () {
        const element = fixture('BasicTestFixture');

        assert.equal(
            window.customElements.get('ez-navigation-hub'),
            element.constructor
        );
    });
});
