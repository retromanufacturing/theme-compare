import { EVENTS } from 'util.events'

class BundleBuyButton extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()

    this.sectionRoot = document.querySelector(`#shopify-section-${this.dataset.sectionId}`)
    this.addToCartButton = this.querySelector('.bundle-add-to-cart')

    this.addToCartButton.addEventListener('click', this.handleClick.bind(this), {
      signal: this.abortController.signal
    })
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  handleClick(event) {
    event.preventDefault()

    const items = this.collectSelectedItems()
    if (items.length === 0) return

    this.addItemsToCart(items)
  }

  // Walks every product card on the page and decides which ones should be
  // added to the cart. The same rule works for every layout this button is
  // used with (required tabs, optional tabs, standalone add-ons, or a plain
  // list with no selection at all):
  //
  //   - No wrapping tab/checkbox element at all -> always include
  //   - A checkbox or radio is present -> include only if it's checked
  //   - No checkbox, but wrapped in a tab panel -> include only if visible
  collectSelectedItems() {
    const items = []

    this.sectionRoot.querySelectorAll('[data-product-id]').forEach((card) => {
      if (!this.cardIsSelected(card)) return

      const picker = card.querySelector('block-variant-picker')
      if (!picker) return

      const variantId = this.getPickerVariantId(picker)
      if (variantId) items.push({ id: variantId, quantity: 1 })
    })

    return items
  }

  cardIsSelected(card) {
    const wrapper = card.closest('[data-tab-index], [data-standalone-optional]')
    if (!wrapper) return true

    const selectionInput = wrapper.querySelector(':scope > input[type="checkbox"], :scope > input[type="radio"]')
    if (selectionInput) return selectionInput.checked

    return wrapper.getAttribute('aria-hidden') !== 'true'
  }

  // block-variant-picker tracks its own selected variant as `currentVariant`,
  // but only after the shopper interacts with it. Cards nobody has touched
  // yet still show their default selection in the DOM, so fall back to
  // reading that directly.
  getPickerVariantId(picker) {
    if (picker.currentVariant) return picker.currentVariant.id

    const checkedRadio = picker.querySelector('input[type="radio"]:checked')
    if (checkedRadio) return parseInt(checkedRadio.value)

    const select = picker.querySelector('select')
    if (select?.value) return parseInt(select.value)

    return null
  }

  // Mirrors the native add-to-cart flow (block.product-buy-buttons.js) so
  // the cart drawer opens and updates itself with no extra code needed here.
  async addItemsToCart(items) {
    this.setLoading(true)

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, sections: 'cart-ajax' })
      })

      if (!response.ok) throw await response.json()

      const product = await response.json()

      this.dispatchEvent(
        new CustomEvent(EVENTS.ajaxProductAdded, {
          bubbles: true,
          detail: { product }
        })
      )
    } catch (error) {
      this.handleError(error)
    } finally {
      this.setLoading(false)
    }
  }

  handleError(error) {
    console.error('Bundle add to cart error:', error)

    this.dispatchEvent(
      new CustomEvent(EVENTS.ajaxProductError, {
        bubbles: true,
        detail: { errorMessage: error.description || error.message }
      })
    )
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.addToCartButton.setAttribute('aria-busy', 'true')
      this.addToCartButton.classList.add('btn--loading')
    } else {
      this.addToCartButton.removeAttribute('aria-busy')
      this.addToCartButton.classList.remove('btn--loading')
    }
  }
}

customElements.define('bundle-buy-button', BundleBuyButton)