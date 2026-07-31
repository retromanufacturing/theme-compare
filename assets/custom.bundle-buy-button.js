import { EVENTS } from 'util.events'
import { collectSelectedItems } from 'module.bundle-selection'

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

    const items = collectSelectedItems(this.sectionRoot)
    if (items.length === 0) return

    this.addItemsToCart(items)
  }

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