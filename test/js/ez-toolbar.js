/* global describe, it, assert, fixture */
describe('ez-toolbar', function() {
    it('should be defined', function () {
        const element = fixture('BasicTestFixture');

        assert.equal(
            window.customElements.get('ez-toolbar'),
            element.constructor
        );
    });
});
