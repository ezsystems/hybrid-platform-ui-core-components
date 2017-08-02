describe('ez-selection-activate-element', function() {
    let element;
    let elementSubsetElementChecked;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
        elementSubsetElementChecked = fixture('TestFixtureSubsetElementChecked');
    });

    function setCheckboxCheckState(checked, checkbox) {
        // that's a bit tricky for Edge and Safari because unlike in others
        // browsers, simulating the click event actually check or uncheck the
        // checkbox, while that's not the case in others browsers. So the click
        // listener allows to force a "checked" status on the checkbox.
        checkbox.addEventListener('click', function () {
            checkbox.checked = checked;
        });
        checkbox.dispatchEvent(new CustomEvent('click', {
            bubbles: true,
            cancelable: true,
        }));
    }

    function checkAndclickOneElement(elem, selector) {
        const checkbox = elem.querySelector(selector);

        setCheckboxCheckState(true, checkbox);
    }

    function checkAndclickEveryElements(elem, selector) {
        const checkboxes = elem.querySelectorAll(selector);

        checkboxes.forEach(setCheckboxCheckState.bind(this, true));
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

                activableElement.disabled = false;
                setCheckboxCheckState(false, checkbox);

                assert.isTrue(activableElement.disabled);
            });
        });
    });
});
