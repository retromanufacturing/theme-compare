import { EVENTS } from 'util.events'

class StickyAddToCart extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    this.buttonOffScreen = false
    this.nearFooter = false
    this.positionTicking = false

    this.setupIntersectionObserver()
    this.watchVariantChanges()
    this.updatePosition()

    window.addEventListener('scroll', () => this.requestPositionUpdate(), {
      signal: this.abortController.signal,
      passive: true
    })
    window.addEventListener('resize', () => this.requestPositionUpdate(), {
      signal: this.abortController.signal
    })

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

  // --- Visibility (show/hide based on real button + footer proximity) ---

  setupIntersectionObserver() {
    const productForm = this.getProductForm()
    if (!productForm) return

    const buyButtonsBlock = productForm.closest('.block-buy-buttons')
    if (!buyButtonsBlock) return

    const footer = this.getFooter()
    if (!footer) return

    // Direction-agnostic: the real button is "off screen" whether it
    // hasn't been scrolled to yet (below the fold) or has been scrolled
    // past (above the viewport) - isIntersecting alone tells us that.
    this.buyButtonsObserver = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (!entry) return
      this.buttonOffScreen = !entry.isIntersecting
      this.updateVisibility()
    })

    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return
        this.nearFooter = entry.isIntersecting
        this.updateVisibility()
      },
      { rootMargin: '200px 0px 0px 0px' }
    )

    this.buyButtonsObserver.observe(buyButtonsBlock)
    this.footerObserver.observe(footer)
  }

  updateVisibility() {
    this.dataset.stuck = this.buttonOffScreen && !this.nearFooter ? 'true' : 'false'
  }

  // --- Position (anchor above/below a configured element, or default bottom) ---

  requestPositionUpdate() {
    if (this.positionTicking) return
    this.positionTicking = true
    requestAnimationFrame(() => {
      this.updatePosition()
      this.positionTicking = false
    })
  }

  setDefaultPosition() {
    this.dataset.anchor = 'bottom'
    this.style.setProperty('--sticky-offset', '0px')
    this.style.setProperty('--sticky-hide-y', '100%')
  }

  updatePosition() {
    const selector = this.dataset.positionSelector
    if (!selector) {
      this.setDefaultPosition()
      return
    }

    const target = document.querySelector(selector)
    const targetVisible = target && target.offsetParent !== null
    if (!targetVisible) {
      this.setDefaultPosition()
      return
    }

    const rect = target.getBoundingClientRect()
    const placement = this.dataset.positionPlacement || 'above'

    if (placement === 'below') {
      // If the target has scrolled fully above the viewport, there's
      // nothing to pin below anymore - fall back to default bottom
      // behavior rather than positioning off-screen.
      if (rect.bottom <= 0) {
        this.setDefaultPosition()
        return
      }
      this.dataset.anchor = 'top'
      this.style.setProperty('--sticky-offset', `${Math.max(rect.bottom, 0)}px`)
      this.style.setProperty('--sticky-hide-y', '-100%')
    } else {
      const offset = Math.max(window.innerHeight - rect.top, 0)
      this.dataset.anchor = 'bottom'
      this.style.setProperty('--sticky-offset', `${offset}px`)
      this.style.setProperty('--sticky-hide-y', '100%')
    }
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