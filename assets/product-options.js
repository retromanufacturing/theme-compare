import { EVENTS } from "@archetype-themes/utils/events"

class ProductOptions extends HTMLElement {
  constructor() {
    super()

    this.classes = {
      hidden: "hide",
    }

    this.options = this.querySelectorAll("[data-variant-info]")
  }

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
    const { html, sectionId, variant } = detail

    if (!variant) {
      this.textContent = ""
      return;
    }

    this.getProductOption(variant.options)
  }

  getProductOption(variants) {
    variants.forEach((variant) => {
      this.updateVariantInfo(variant)
    })
  }

  updateVariantInfo(activeVariant) {
    let options = this.options

    options.forEach((option) => {
      let value = option.getAttribute("data-option-value")

      if (value == activeVariant || activeVariant.includes(value)) {
        option.classList.remove(this.classes.hidden)
      } else {
        option.classList.add(this.classes.hidden)
      }
    })
  }
}

customElements.define("product-options", ProductOptions)
