# Enable button(s) based on a selection

Specifications for https://jira.ez.no/browse/EZP-27572

Goal here is to provide activable elements (like buttons) that are enabled and
can triggers actions only if some elements in a list are selected.  The
selection is done with the help of checkboxes or radio buttons. Some buttons
need at least one or more element checked to be enabled, but others will need
one and only one element checked to be enabled.

This behavior is implemented by the `ez-selection-activate-element` custom element.

## Markup

### Enable a button based on checkboxes


```html
<ez-selection-activate-element>
    <ul>
        <li><input type="checkbox"></li>
        <li><input type="checkbox"></li>
    </ul>
    <!-- ... -->
    <button class="ez-js-activable-element" disabled>Do!</button>
</ez-selection-activate-element>
```

### Enable a button only if one element is selected


```html
<ez-selection-activate-element>
    <ul>
        <li><input type="checkbox"></li>
        <li><input type="checkbox"></li>
    </ul>
    <!-- ... -->
    <button class="ez-js-activable-element ez-js-activable-element-single-selection" disabled>Do!</button>
</ez-selection-activate-element>
```

### Enable a button based on a subset of checkboxes

```html
<ez-selection-activate-element selection-selector=".checkboxes-that-matches">
    <ul>
        <li><input type="checkbox" class"this-checkbox-will-not-match"></li>
        <li><input type="checkbox" class"checkboxes-that-matches"></li>
    </ul>
    <!-- ... -->
    <button class="ez-js-activable-element" disabled>Do!</button>
</ez-selection-activate-element>
```

### Constraints:

* The activable element must have the `ez-js-activable-element` class.
* If the activable element should be enabled only by specific checkboxes or
  radio button, those must match `<ez-selection-activate-element>`'s
  `selection-selector`.
* If the activable element should be enabled by one and only one checkbox, the
  activable element should have the `ez-js-activable-element-single-selection`
  in addition to `ez-js-activable-element` class.

## How it works

When a checkbox is checked, if it matches the `selection-selector` of the custom
element (which is `input[type='checkbox']` by default) the button(s) (or any
activable elements) that have the `ez-js-activable-element` class will be
enabled. If multiple checkboxes are checked, the button will be activated only
if it does not have the `ez-js-activable-element-single-selection` class.
