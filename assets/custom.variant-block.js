import { EVENTS } from 'util.events'

class VariantBlock extends HTMLElement {
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
    const { html, variant, sectionId } = detail

    if (!variant || !html) return

    const source = html.querySelector(
        `variant-block[data-section-id="${sectionId}"][data-product-id="${this.dataset.productId}"][data-block-id="${this.dataset.blockId}"]`
    )

    if (source) {
      this.innerHTML = source.innerHTML
    }

  }
}

customElements.define('variant-block', VariantBlock)