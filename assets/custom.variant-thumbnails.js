import { EVENTS } from 'util.events'

class VariantThumbnails extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()

    document.addEventListener(
      `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
      this.handleVariantChange.bind(this),
      { signal: this.abortController.signal }
    )
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  handleVariantChange({ detail }) {
    const { variant } = detail
    if (!variant) return

    this.querySelectorAll('[data-variant-id]').forEach((thumb) => {
      const matches = thumb.dataset.variantId === String(variant.id)
      thumb.toggleAttribute('data-hidden', !matches)
      thumb.classList.toggle('product__thumb-item-hide', !matches)
    })
  }
}

customElements.define('variant-thumbnails', VariantThumbnails)