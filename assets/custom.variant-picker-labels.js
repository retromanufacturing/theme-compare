// Overrides BlockVariantPicker.prototype.updateColorNames, defined in
// block.product-variant-picker.js, so the color label reflects a custom
// display name instead of the raw option value on variant change.
//
// Reason for a prototype override instead of a separate listener: the
// label DOM (data-variant-color-label) and the lookup data
// (data-swatch-labels) both live inside the same <fieldset> that
// updateColorNames already targets, so overriding it directly reuses that
// existing DOM traversal rather than duplicating it in a second element.
//
// This is a full replacement of the method, not an extension of it — if
// Expanse ever changes what updateColorNames does, this override won't
// pick up that change automatically. Check both files if this behavior
// ever needs to change.
customElements.whenDefined('block-variant-picker').then(() => {
  const BlockVariantPicker = customElements.get('block-variant-picker')

  BlockVariantPicker.prototype.updateColorNames = function () {
    // Same fieldset loop as the original method: one color label per option group
    this.querySelectorAll('fieldset').forEach((fieldset) => {
      const input = fieldset.querySelector('input:checked')
      if (!input) return

      const colorLabel = fieldset.querySelector('[data-variant-color-label]')
      if (!colorLabel) return

      // Default to the raw selected value, same as the original method
      let displayLabel = input.value

      // data-swatch-labels is only present when this option uses the
      // custom Variant Swatches metaobject (see block.variant-swatch.liquid)
      if (fieldset.dataset.swatchLabels) {
        try {
          // Two parallel arrays, index-matched: raw label at index N
          // corresponds to display label at index N
          const rawLabels = JSON.parse(fieldset.dataset.swatchLabels)
          const displayLabels = JSON.parse(fieldset.dataset.swatchDisplayLabels)

          const index = rawLabels.indexOf(input.value)
          // displayLabels[index] can be an empty string if the metaobject
          // entry's display_label field was left blank — fall back to the
          // raw label in that case, same rule as the initial page render
          if (index !== -1) displayLabel = displayLabels[index] || rawLabels[index]
        } catch (error) {
          // Malformed or missing JSON — fall back to the raw value already set above
        }
      }

      colorLabel.textContent = displayLabel
    })
  }
})