class VariantBlock extends HTMLElement {
  connectedCallback() {
    document.addEventListener(
      `variantChange:${this.dataset.sectionId}:${this.dataset.productId}`,
      ({ detail }) => {
        const { html, variant, sectionId } = detail
        console.log('variant:', variant)
        console.log('html:', html)
        if (html) {
          const source = html.querySelector(`variant-block[data-section-id="${sectionId}"][data-product-id="${this.dataset.productId}"]`)
          console.log('source found:', source)
          console.log('source innerHTML:', source?.innerHTML)
        }
      }
    )
  }
}

customElements.define('variant-block', VariantBlock)

// Attach to an existing block-variant-picker to get the right sectionId and productId
const picker = document.querySelector('block-variant-picker')
const test = document.createElement('variant-block-test')
test.dataset.sectionId = picker.dataset.sectionId
test.dataset.productId = picker.dataset.productId
document.body.appendChild(test)