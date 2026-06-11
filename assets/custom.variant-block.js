import { EVENTS } from 'util.events'

class VariantBlock extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()

    document.addEventListener(
  `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
  ({ detail }) => {
    const { html, variant, sectionId } = detail
    console.log('variant id:', variant?.id)
    console.log('html type:', html?.constructor?.name)
    console.log('variant-block in html:', html?.querySelector(`variant-block[data-section-id="${sectionId}"]`))
  },
  { signal: this.abortController.signal }
)
  }

  disconnectedCallback() {
    this.abortController.abort()
  }
}

customElements.define('variant-block', VariantBlock)