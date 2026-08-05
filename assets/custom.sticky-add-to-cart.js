import { EVENTS } from 'util.events'

class StickyAddToCart extends HTMLElement {
 connectedCallback() {
  // Guard against the DOM-move below re-triggering this callback in a
  // loop - appendChild to a new parent fires disconnectedCallback then
  // connectedCallback again, so this only actually runs setup once
  // we're already at the top level.
  if (this.parentElement !== document.body) {
    document.body.appendChild(this)
    return
  }

  this.abortController = new AbortController()
  this.buttonOffScreen = false
  this.nearFooter = false
  this.hasScrolled = false

  this.setupIntersectionObserver()
  this.watchVariantChanges()
  this.updatePosition()
  this.startPositionLoop()

  window.addEventListener(
    'scroll',
    () => {
      if (!this.hasScrolled) {
        this.hasScrolled = true
        this.updateVisibility()
      }
    },
    { signal: this.abortController.signal, passive: true }
  )

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
    this.stopPositionLoop()
  }

  getProductForm() {
  const section = document.getElementById(`shopify-section-${this.dataset.sectionId}`)
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
    if (!this.hasScrolled) {
      this.dataset.stuck = 'false'
      return
    }
    this.dataset.stuck = this.buttonOffScreen && !this.nearFooter ? 'true' : 'false'
  }

  // --- Position (anchor above/below a configured element, or default bottom) ---

  // Runs every frame rather than reacting to specific events, so a CSS
  // transition on the target (e.g. the header compressing on scroll)
  // can never leave our offset stale - only active while a selector is
  // actually configured, since the default bottom position never changes.
  startPositionLoop() {
    if (!this.dataset.positionSelector) return
    const loop = () => {
      this.updatePosition()
      this.positionLoopId = requestAnimationFrame(loop)
    }
    this.positionLoopId = requestAnimationFrame(loop)
  }

  stopPositionLoop() {
    if (this.positionLoopId) cancelAnimationFrame(this.positionLoopId)
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