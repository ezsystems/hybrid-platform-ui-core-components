describe('ez-notification', function() {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    function simulateClick(element) {
        element.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            buttons: 1,
            composed: true,
        }));
    }

    it('should be defined', function () {
        assert.equal(
            window.customElements.get('ez-notification'),
            element.constructor
        );
    });

    describe('properties', function () {
        describe('`type`', function () {
            it('should default to an empty string', function () {
                assert.equal('', element.type);
            });

            describe('set', function () {
                it('should be reflected to an attribute', function () {
                    element.type = 'whatever';

                    assert.equal(
                        element.type,
                        element.getAttribute('type')
                    );
                });
            });
        });

        describe('`timeout`', function () {
            it('should default to 0', function () {
                assert.equal(0, element.timeout);
            });
        });

        describe('`copyable`', function () {
            it('should be defined', function () {
                element.setAttribute('copyable', '');

                assert.isTrue(element.copyable);
            });

            it('should default to false', function () {
                assert.isFalse(element.copyable);
            });
        });

        describe('`details`', function () {
            it('should be defined', function () {
                element.setAttribute('details', 'some details');

                assert.equal(
                    element.details,
                    element.getAttribute('details')
                );
            });
        });
    });

    describe('content', function () {
        let elementWithContent;

        beforeEach(function () {
            elementWithContent = fixture('WithContentTestFixture');
        });

        it('should be distributed in the default slot', function () {
            const content = elementWithContent.querySelector('.notification-content');

            assert.isNotNull(content.assignedSlot);
        });
    });

    describe('removal', function () {
        it('should be automatic after timeout second', function (done) {
            const parent = element.parentNode;

            element.timeout = 0.1;

            setTimeout(function () {
                assert.isNull(
                    parent.querySelector('ez-notification'),
                    'The notification should have been removed'
                );
                done();
            }, element.timeout * 1.5 * 1000);
        });
    });

    describe('close button', function () {
        it('should remove the notification', function () {
            const parent = element.parentNode;

            simulateClick(element.shadowRoot.querySelector('button.close'));

            assert.isNull(parent.querySelector('ez-notification'));
        });
    });

    describe('copy button', function () {
        let copyableElement;

        beforeEach(function (done) {
            copyableElement = fixture('CopyableElement');
            flush(function () {
                done();
            });
        });

        it('should be generated', function () {
            assert.isNotNull(
                copyableElement.shadowRoot.querySelector('button.copy')
            );
        });

        describe('click', function () {
            let selectDetails;

            beforeEach(function () {
                sinon.spy(document, 'execCommand');
                selectDetails = sinon.spy(copyableElement.shadowRoot.querySelector('.details'), 'select');
            });

            afterEach(function () {
                document.execCommand.restore();
                selectDetails.restore();
            });

            it('should copy details', function () {
                simulateClick(copyableElement.shadowRoot.querySelector('button.copy'));
                assert.isTrue(
                    selectDetails.calledOnce,
                    'The details should have been selected'
                );
                assert.isTrue(document.execCommand.calledOnce);
                assert.isTrue(document.execCommand.alwaysCalledWith('copy'));
            });
        });
    });
});
