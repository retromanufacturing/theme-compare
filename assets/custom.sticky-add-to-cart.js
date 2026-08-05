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
    this.currentPushAmount = 0
    this.lastOffset = null
    this.lastHideY = null
    this.lastPushActive = null
    this.lastPushHeight = null

    this.setupObservers()
    this.watchVariantChanges()
    this.watchTargetChanges()
    this.updatePosition()
    this.burstPositionLoop()

    window.addEventListener(
      'scroll',
      () => {
        this.hasScrolled = true
        this.burstPositionLoop()
      },
      { signal: this.abortController.signal, passive: true }
    )
    window.addEventListener('resize', () => this.burstPositionLoop(), {
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
    this.footerObserver?.disconnect()
    this.mutationObserver?.disconnect()
    this.stopPositionLoop()
    this.getContentPushTarget()?.style.removeProperty('padding-top')
  }

  getProductForm() {
    const section = document.getElementById(`shopify-section-${this.dataset.sectionId}`)
    if (!section) return null
    return section.querySelector(`#product-form-${this.dataset.sectionId}`)
  }

  getFooter() {
    return document.querySelector('footer-section') ?? document.querySelector('[class*="footer-group"]')
  }

  getContentPushTarget() {
    const selector = this.dataset.contentPushSelector
    if (!selector) return null
    return document.querySelector(selector)
  }

  // IntersectionObserver alone doesn't know the header sits on top of
  // the viewport - a button can be geometrically "intersecting" while
  // fully hidden behind it. Use the header's real bottom edge as the
  // effective top of the page instead of 0.
  getUsableTop() {
    const header = document.querySelector('header-section')
    if (header && header.offsetParent !== null) {
      const rect = header.getBoundingClientRect()
      if (rect.top <= 0) return rect.bottom
    }
    return 0
  }

  // --- Visibility (show/hide based on real button + footer proximity) ---

  setupObservers() {
    const productForm = this.getProductForm()
    if (!productForm) return

    this.buyButtonsBlock = productForm.closest('.block-buy-buttons')
    if (!this.buyButtonsBlock) return

    const footer = this.getFooter()
    if (!footer) return

    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return
        this.nearFooter = entry.isIntersecting
        this.updateVisibility()
      },
      { rootMargin: '200px 0px 0px 0px' }
    )

    this.footerObserver.observe(footer)
  }

  // Runs every burst frame rather than as an