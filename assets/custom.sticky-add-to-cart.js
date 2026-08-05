import { EVENTS } from 'util.events'

class StickyAddToCart extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    this.isStuck = false
    this.hiddenByBottom = false

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

  getProductForm() {
    const section = this.closest('.shopify-section')
    if (!section) return null
    return section.querySelector(`#product-form-${this.dataset.sectionId}`)
  }

  getFooter() {
    return document.querySelector('footer-section') ?? document.querySelector('[class*="footer-group"]')
  }

  setupIntersectionObserver() {
    const productForm = this.getProductForm()
    console.log('[sticky] productForm:', productForm)
    if (!productForm) return

    const buyButtonsBlock = productForm.closest('.block-buy-buttons')
    console.log('[sticky] buyButtonsBlock:', buyButtonsBlock)
    if (!buyButtonsBlock) return

    const footer = this.getFooter()
    console.log('[sticky] footer:', footer)
    if (!footer) return

    console.log('[sticky] observers attached')

    this.buyButtonsObserver = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (!entry) return
      console.log('[sticky] buyButtons intersecting:', entry.isIntersecting, 'isStuck:', this.isStuck)

      if (!entry.isIntersecting && !this.isStuck) {
        const rect = entry.target.getBoundingClientRect()
        console.log('[sticky] rect.bottom:', rect.bottom, 'rect.top:', rect.top)
        if (rect.bottom < 0 || rect.top < 0) this.show()
      } else if (entry.isIntersecting && this.isStuck) {
        this.hiddenByBottom = false
        this.hide()
      }
    })

    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return

        if (entry.isIntersecting && this.isStuck) {
          this.hiddenByBottom = true
          this.hide()
        } else if (!entry.isIntersecting && this.hiddenByBottom) {
          const rect = buyButtonsBlock.getBoundingClientRect()
          if (rect.bottom < 0 || rect.top < 0) {
            this.hiddenByBottom = false
            this.show()
          }
        }
      },
      { rootMargin: '200px 0px 0px 0px' }
    )

    this.buyButtonsObserver.observe(buyButtonsBlock)
    this.footerObserver.observe(footer)
  }

  show() {
    if (this.isElementColliding()) return
    this.isStuck = true
    this.dataset.stuck = 'true'
  }

  hide() {
    this.isStuck = false
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
    this.getProductForm()?.requestSubmit()
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