describe('ez-field-edit', function() {
    let elementSimple;
    let elementSimpleLabelDeeper;
    let elementSimpleInputDeeper;
    let elementWithMultipleSameDeep;
    let elementWithMultipleInputDeeper;
    let elementWithMultipleLabelDeeper;
    let elementWithoutLabel;

    beforeEach(function () {
        elementSimple = fixture('BasicTestFixtureSimple');
        elementSimpleLabelDeeper = fixture('BasicTestFixtureSimpleLabelDeeper');
        elementSimpleInputDeeper = fixture('BasicTestFixtureSimpleInputDeeper');
        elementWithMultipleSameDeep = fixture('BasicTestFixtureMultipleSameDeep');
        elementWithMultipleInputDeeper = fixture('BasicTestFixtureMultipleInputDeeper');
        elementWithMultipleLabelDeeper = fixture('BasicTestFixtureMultipleLabelDeeper');
        elementWithoutLabel = fixture('BasicTestFixtureInputWithoutLabel');
    });

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-field-edit'),
            elementSimple.constructor
        );
    });

    describe('properties', function () {
        describe('`invalid`', function () {
            it('should default to false', function () {
                assert.notOk(elementSimple.invalid);
            });

            describe('set', function () {
                it('should be reflected to an attribute', function () {
                    elementSimple.invalid = true;

                    assert.isTrue(
                        elementSimple.hasAttribute('invalid')
                    );
                });
            });
        });
    });

    describe('validity', function () {
        it('should get invalid', function () {
            elementSimple.querySelector('input').value = 'invalid value';
            elementSimple.dispatchEvent(new CustomEvent('input'));
            assert.isTrue(
                elementSimple.invalid
            );
        });

        it('should get valid', function () {
            elementSimple.invalid = true;
            elementSimple.querySelector('input').value = 42;
            elementSimple.dispatchEvent(new CustomEvent('input'));
            assert.isFalse(
                elementSimple.invalid
            );
        });

        it('should stay invalid if not every inputs get valid', function () {
            const lowestCommonParent1 = elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep1');
            const lowestCommonParent2 = elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep2');

            lowestCommonParent1.classList.add('ez-invalid-input');
            lowestCommonParent2.classList.add('ez-invalid-input');

            elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep1 input').value = 'invalid';
            elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep2 input').value = 42;

            elementWithMultipleSameDeep.dispatchEvent(new CustomEvent('input'));
            assert.isTrue(
                elementWithMultipleSameDeep.invalid
            );
        });
    });

    describe('`ez-invalid-input` class', function () {
        function fillSimpleInput(element, value) {
            element.querySelector('input').value = value;
            element.dispatchEvent(new CustomEvent('input'));
        }
        function fillMultipleInputs(element, input1, input2, value1, value2) {
            input1.value = value1;
            input2.value = value2;
            element.dispatchEvent(new CustomEvent('input'));
        }
        describe('unique input', function () {
            describe('with label', function () {
                it('should be set on lowest common ancestor', function () {
                    fillSimpleInput(elementSimple, 'invalid value');
                    assert.isTrue(
                        elementSimple.classList.contains('ez-invalid-input')
                    );
                });

                it('should be remove from lowest common ancestor', function () {
                    elementSimple.classList.add('ez-invalid-input');

                    fillSimpleInput(elementSimple, 42);
                    assert.isFalse(
                        elementSimple.classList.contains('ez-invalid-input')
                    );
                });


                describe('label deeper than input', function () {
                    it('should be set on lowest common ancestor', function () {
                        fillSimpleInput(elementSimpleLabelDeeper, 'invalid value');
                        assert.isTrue(
                            elementSimpleLabelDeeper.classList.contains('ez-invalid-input')
                        );
                    });

                    it('should be remove from lowest common ancestor', function () {
                        elementSimpleLabelDeeper.classList.add('ez-invalid-input');

                        fillSimpleInput(elementSimpleLabelDeeper, 42);
                        assert.isFalse(
                            elementSimpleLabelDeeper.classList.contains('ez-invalid-input')
                        );
                    });
                });

                describe('input deeper than label', function () {
                    it('should be set on lowest common ancestor', function () {
                        elementSimpleInputDeeper.classList.add('ez-invalid-input');

                        fillSimpleInput(elementSimpleInputDeeper, 42);
                        assert.isFalse(
                            elementSimpleInputDeeper.classList.contains('ez-invalid-input')
                        );
                    });

                    it('should be remove from lowest common ancestor', function () {
                        elementSimpleInputDeeper.classList.add('ez-invalid-input');

                        fillSimpleInput(elementSimpleInputDeeper, 42);
                        assert.isFalse(
                            elementSimpleInputDeeper.classList.contains('ez-invalid-input')
                        );
                    });
                });
            });

            describe('without label', function () {
                it('should be set on parent node', function () {
                    fillSimpleInput(elementWithoutLabel, 'invalid value');
                    assert.isTrue(
                        elementWithoutLabel.querySelector('input').parentNode.classList.contains('ez-invalid-input')
                    );
                });

                it('should be remove from parent node', function () {
                    const input = elementWithoutLabel.querySelector('input');

                    input.parentNode.classList.add('ez-invalid-input');
                    fillSimpleInput(elementWithoutLabel, 42);
                    assert.isFalse(
                        input.parentNode.classList.contains('ez-invalid-input')
                    );
                });
            });
        });

        describe('multiple inputs', function () {
            describe('with label', function () {
                it('should be set on lowest common ancestor', function () {
                    fillMultipleInputs(
                        elementWithMultipleSameDeep,
                        elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep1 input'),
                        elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep2 input'),
                        'invalid value',
                        ''
                    );
                    assert.isTrue(
                        elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep1').classList.contains('ez-invalid-input')
                    );
                    assert.isFalse(
                        elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep2').classList.contains('ez-invalid-input')
                    );
                });

                it('should be remove from lowest common ancestor', function () {
                    const lowestCommonParent1 = elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep1');
                    const lowestCommonParent2 = elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep2');

                    lowestCommonParent1.classList.add('ez-invalid-input');
                    lowestCommonParent2.classList.add('ez-invalid-input');

                    fillMultipleInputs(
                        elementWithMultipleSameDeep,
                        elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep1 input'),
                        elementWithMultipleSameDeep.querySelector('#lowestCommonParentSameDeep2 input'),
                        42,
                        'notValid'
                    );
                    assert.isFalse(
                        lowestCommonParent1.classList.contains('ez-invalid-input')
                    );
                    assert.isTrue(
                        lowestCommonParent2.classList.contains('ez-invalid-input')
                    );
                });

                describe('label deeper than input', function () {
                    it('should be set on lowest common ancestor', function () {
                        fillMultipleInputs(
                            elementWithMultipleLabelDeeper,
                            elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper1 input'),
                            elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper2 input'),
                            'invalid value',
                            ''
                        );
                        assert.isTrue(
                            elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper1').classList.contains('ez-invalid-input')
                        );
                        assert.isFalse(
                            elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper2').classList.contains('ez-invalid-input')
                        );
                    });

                    it('should be remove from lowest common ancestor', function () {
                        const lowestCommonParent1 = elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper1');
                        const lowestCommonParent2 = elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper2');

                        lowestCommonParent1.classList.add('ez-invalid-input');
                        lowestCommonParent2.classList.add('ez-invalid-input');

                        fillMultipleInputs(
                            elementWithMultipleLabelDeeper,
                            elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper1 input'),
                            elementWithMultipleLabelDeeper.querySelector('#lowestCommonParentLabelDeeper2 input'),
                            42,
                            'notValid'
                        );
                        assert.isFalse(
                            lowestCommonParent1.classList.contains('ez-invalid-input')
                        );
                        assert.isTrue(
                            lowestCommonParent2.classList.contains('ez-invalid-input')
                        );
                    });
                });

                describe('input deeper than label', function () {
                    it('should be set on lowest common ancestor', function () {
                        fillMultipleInputs(
                            elementWithMultipleInputDeeper,
                            elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper1 input'),
                            elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper2 input'),
                            'invalid value',
                            ''
                        );
                        assert.isTrue(
                            elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper1').classList.contains('ez-invalid-input')
                        );
                        assert.isFalse(
                            elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper2').classList.contains('ez-invalid-input')
                        );
                    });

                    it('should be remove from lowest common ancestor', function () {
                        const lowestCommonParent1 = elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper1');
                        const lowestCommonParent2 = elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper2');

                        lowestCommonParent1.classList.add('ez-invalid-input');
                        lowestCommonParent2.classList.add('ez-invalid-input');

                        fillMultipleInputs(
                            elementWithMultipleInputDeeper,
                            elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper1 input'),
                            elementWithMultipleInputDeeper.querySelector('#lowestCommonParentInputDeeper2 input'),
                            42,
                            'notValid'
                        );
                        assert.isFalse(
                            lowestCommonParent1.classList.contains('ez-invalid-input')
                        );
                        assert.isTrue(
                            lowestCommonParent2.classList.contains('ez-invalid-input')
                        );
                    });
                });
            });
        });
    });
});
