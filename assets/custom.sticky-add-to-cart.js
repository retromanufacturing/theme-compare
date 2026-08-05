import { EVENTS } from 'util.events'

class StickyAddToCart extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()

    this.setupIntersectionObserver()
    this.watchVariantChanges()

    // Delegated on the persistent outer element, not the button itself,
    // since the button gets destroyed and recreated on every variant
    // change (see watchVariantChanges) - a listener attached directly to
    // it would silently stop working after the first swap.
    this.addEventListener(
      'click',
      (event) => {
        if (event.target.closest('[data-sticky-add-to-cart-button]')) {
          this.handleAddToCartClick(event)
        }
      },
      { signal: this.abortController.signal }
    )
  }

  disconnectedCallback() {
    this.abortController.abort()
    this.buyButtonsObserver?.disconnect()
    this.footerObserver?.disconnect()
  }

  setupIntersectionObserver() {
    const buyButtons = document.querySelector(`#shopify-section-${this.dataset.sectionId} .block-buy-buttons`)
    const footer = document.querySelector('footer-section')
    if (!buyButtons || !footer) return

    this.buyButtonsObserver = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (!entry) return

      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        this.show()
      } else {
        this.hide()
      }
    })

    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) this.hide()
      },
      { rootMargin: '200px 0px 0px 0px' }
    )

    this.buyButtonsObserver.observe(buyButtons)
    this.footerObserver.observe(footer)
  }

  show() {
    if (this.isElementColliding()) return
    this.dataset.stuck = 'true'
  }

  hide() {
    this.dataset.stuck = 'false'
  }

  // Generic collision avoidance - checks for a visible instance of
  // whatever selector is configured, instead of hardcoding one element.
  isElementColliding() {
    const selector = this.dataset.avoidSelector
    if (!selector) return false

    const el = document.querySelector(selector)
    return !!el && el.offsetParent !== null
  }

  handleAddToCartClick(event) {
    event.preventDefault()
    const form = document.querySelector(`#product-form-${this.dataset.sectionId}`)
    form?.requestSubmit()
  }

  // Keeps price/title/image/button state in sync using the same fetched
  // HTML the real variant picker already retrieves - no separate fetch.
  // Full innerHTML replacement (no morph utility available in Expanse),
  // which is why the click listener above is delegated rather than
  // attached to the button directly.
  watchVariantChanges() {
    document.addEventListener(
      `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
      (event) => {
        const { html, variant, loading } = event.detail
        if (!variant || !html || loading) return

        const freshBar = html.querySelector('sticky-add-to-cart')
        if (freshBar) this.innerHTML = freshBar.innerHTML

        this.dataset.currentVariantId = variant.id
        this.dataset.variantAvailable = variant.available
      },
      { signal: this.abortController.signal }
    )
  }
}

customElements.define('sticky-add-to-cart', StickyAddToCart)