import { EVENTS } from 'util.events'

class VariantBlock extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()

    document.addEventListener(
      `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
      ({ detail }) => console.log(detail),
      { signal: this.abortController.signal }
    )
  }

  disconnectedCallback() {
    this.abortController.abort()
  }
}

customElements.define('variant-block', VariantBlock)