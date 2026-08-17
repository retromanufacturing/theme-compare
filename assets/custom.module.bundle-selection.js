// Decides whether a product card should be included in the bundle. The
// same rule covers every layout this is used with — required tabs,
// optional tabs, standalone add-ons, or a plain list with no selection UI:
//
//   - No wrapping tab/checkbox element at all -> always include
//   - A checkbox or radio is present -> include only if it's checked
//   - No checkbox, but wrapped in a tab panel -> include only if visible
export function cardIsSelected(card) {
  const wrapper = card.closest('[data-tab-index], [data-standalone-optional]')
  if (!wrapper) return true

  const selectionInput = wrapper.querySelector(':scope > input[type="checkbox"], :scope > input[type="radio"]')
  if (selectionInput) return selectionInput.checked

  return wrapper.getAttribute('aria-hidden') !== 'true'
}

// kit-variant-picker keeps its current variant in a JSON script tag that's
// replaced along with the rest of the element's markup on every variant
// change, so it always reflects the live selection — no method calls needed.
export function getPickerVariantId(picker) {
  const script = picker.querySelector('[data-kit-selected-variant]')
  if (!script) return null

  try {
    const variant = JSON.parse(script.textContent)
    return variant?.id ?? null
  } catch (error) {
    return null
  }
}

// Walks every product card in the given scope and returns the variant IDs
// that should be added to the cart, in {id, quantity} pairs.
export function collectSelectedItems(sectionRoot) {
  const items = []

  sectionRoot.querySelectorAll('[data-product-id]').forEach((card) => {
    if (!cardIsSelected(card)) return

    const picker = card.querySelector('kit-variant-picker')
    if (!picker) return

    const variantId = getPickerVariantId(picker)
    if (variantId) items.push({ id: variantId, quantity: 1 })
  })

  return items
}