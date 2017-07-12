describe('ez-selection-activate-element', function() {
    let element;
    let elementSubsetElementChecked;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
        elementSubsetElementChecked =  fixture('TestFixtureSubsetElementChecked');
    });

    function checkAndclickOneElement(elem, selector) {
        const checkbox = elem.querySelector(selector);
        // we need to prevent the click event at the document level
        // to prevent Edge/Safari from checking the input when clicked
        // so preventDefault() will be called in the test but we verify
        // that's it not called, that's why `preventDefaultCalled`
        // local variable was introduced.
        let preventDefaultCalled = false;
        const prevent = function(e) {
            preventDefaultCalled = e.defaultPrevented;
            e.preventDefault();
        };

        document.addEventListener('click', prevent);
        checkbox.checked = true;
        checkbox.dispatchEvent(new CustomEvent('click', {
            bubbles: true,
        }));

        assert.isFalse(preventDefaultCalled);
    }

    function checkAndclickEveryElements(elem, selector) {
        const checkboxes = elem.querySelectorAll(selector);
        // same comment than in checkAndclickOneElement().
        let preventDefaultCalled = false;
        const prevent = function(e) {
            preventDefaultCalled = e.defaultPrevented;
            e.preventDefault();
        };

        document.addEventListener('click', prevent);
        checkboxes.forEach((checkbox) => {
            checkbox.checked = true;
            checkbox.dispatchEvent(new CustomEvent('click', {
                bubbles: true,
            }));
        });

        assert.isFalse(preventDefaultCalled);
    }

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-selection-activate-element'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`selectionSelector`', function () {
            it('should default to `input[type="checkbox"]``', function () {
                assert.equal(element.selectionSelector, 'input[type="checkbox"]');
            });
        });
    });

    describe('activate elements', function () {
        describe('single selection', function () {
            it('should enable activable buttons', function () {
                const activableElement = element.querySelector('.ez-js-activable-element');
                const activableElementSingleSelection = element.querySelector('.ez-js-activable-element.ez-js-activable-element-single-selection');


                checkAndclickOneElement(element, element.selectionSelector);
                assert.isFalse(activableElement.disabled);
                assert.isFalse(activableElementSingleSelection.disabled);
            });
            describe('custom selection', function () {
                it('should enable activable buttons based on custom selection', function () {
                    const activableElement = elementSubsetElementChecked.querySelector('.ez-js-activable-element');
                    const activableElementSingleSelection = elementSubsetElementChecked.querySelector('.ez-js-activable-element.ez-js-activable-element-single-selection');

                    checkAndclickOneElement(elementSubsetElementChecked, elementSubsetElementChecked.selectionSelector);
                    assert.isFalse(activableElement.disabled);
                    assert.isFalse(activableElementSingleSelection.disabled);
                });

                it('should not enable if the activable button does not match the custom selection', function () {
                    const activableElement = elementSubsetElementChecked.querySelector('.ez-js-activable-element');
                    const activableElementSingleSelection = elementSubsetElementChecked.querySelector('.ez-js-activable-element.ez-js-activable-element-single-selection');

                    checkAndclickOneElement(elementSubsetElementChecked, '.this-checkbox-will-not-match');
                    assert.isTrue(activableElement.disabled);
                    assert.isTrue(activableElementSingleSelection.disabled);
                });
            });
        });

        describe('multiple selection', function () {
            it('should enable activable button without the single selection class', function () {
                const activableElement = element.querySelector('.ez-js-activable-element');
                const activableElementSingleSelection = element.querySelector('.ez-js-activable-element.ez-js-activable-element-single-selection');

                checkAndclickEveryElements(element, element.selectionSelector);
                assert.isFalse(activableElement.disabled);
                assert.isTrue(activableElementSingleSelection.disabled);
            });

            describe('custom selection', function () {
                it('should enable activable buttons based on custom selection', function () {
                    const activableElement = elementSubsetElementChecked.querySelector('.ez-js-activable-element');
                    const activableElementSingleSelection = elementSubsetElementChecked.querySelector('.ez-js-activable-element.ez-js-activable-element-single-selection');

                    checkAndclickEveryElements(elementSubsetElementChecked, elementSubsetElementChecked.selectionSelector);
                    assert.isFalse(activableElement.disabled);
                    assert.isTrue(activableElementSingleSelection.disabled);
                });

                it('should not enable if the activable button does not match the custom selection', function () {
                    const activableElement = elementSubsetElementChecked.querySelector('.ez-js-activable-element');
                    const activableElementSingleSelection = elementSubsetElementChecked.querySelector('.ez-js-activable-element.ez-js-activable-element-single-selection');

                    checkAndclickEveryElements(elementSubsetElementChecked, '.this-checkbox-will-not-match');
                    assert.isTrue(activableElement.disabled);
                    assert.isTrue(activableElementSingleSelection.disabled);
                });
            });
        });

        describe('no selection', function () {
            it('should disable elements', function () {
                const activableElement = element.querySelector('.ez-js-activable-element');
                const checkbox = element.querySelector(element.selectionSelector);
                // we need to prevent the click event at the document level
                // to prevent Edge/Safari from checking the input when clicked
                // so preventDefault() will be called in the test but we verify
                // that's it not called, that's why `preventDefaultCalled`
                // local variable was introduced.
                let preventDefaultCalled = false;
                const prevent = function(e) {
                    preventDefaultCalled = e.defaultPrevented;
                    e.preventDefault();
                };

                activableElement.disabled = false;
                document.addEventListener('click', prevent);
                checkbox.dispatchEvent(new CustomEvent('click', {
                    bubbles: true,
                }));

                assert.isFalse(preventDefaultCalled);
                assert.isTrue(activableElement.disabled);
            });
        });
    });
});
