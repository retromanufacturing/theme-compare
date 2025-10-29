import { EVENTS } from './events.js';

console.log("product variants running")

class ProductSection extends HTMLElement {
  constructor(){
    super()

    this.classes = {
      hidden: 'hide'
    }

     this.variantSku = this.querySelectorAll("[data-variant-sku]")
  }
  
  connectedCallback() {
    this.abortController = new AbortController();

    document.addEventListener(
      `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
      this.getVariantInfo.bind(this),
      { signal: this.abortController.signal }
    );
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  getVariantInfo({ detail }) {
    const { html, variant } = detail

    if (!variant) {
      return
    }

    console.log(variant.sku)
    // this.updateVariantFeatures(variant.sku)
    
  }

  updateVariantFeatures(activeVariantSku){
    console.log(activeVariantSku)
  }
}

customElements.define("variant-section", ProductSection);
