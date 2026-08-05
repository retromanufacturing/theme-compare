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

  // Runs every burst frame rather than as an IntersectionObserver
  // callback - subtracting our own content-push contribution below
  // requires fresh geometry each frame, and needs to stay in lockstep
  // with updatePosition() to avoid the two fighting each other.
  checkButtonVisibility() {
    if (!this.buyButtonsBlock) return
    const rect = this.buyButtonsBlock.getBoundingClientRect()
    const pushAmount = this.currentPushAmount || 0
    // Subtract our own padding-top contribution before deciding -
    // otherwise showing the bar can shift the button back into view,
    // hiding the bar, which un-shifts it, showing the bar again: a
    // self-sustaining feedback loop between visibility and content-push.
    const adjustedBottom = rect.bottom - pushAmount
    const adjustedTop = rect.top - pushAmount
    const usableTop = this.getUsableTop()
    this.buttonOffScreen = adjustedBottom < usableTop || adjustedTop > window.innerHeight
    this.updateVisibility()
  }

  updateVisibility() {
    if (!this.hasScrolled) {
      this.dataset.stuck = 'false'
      return
    }
    this.dataset.stuck = this.buttonOffScreen && !this.nearFooter ? 'true' : 'false'
  }

  // --- Position (anchor above/below a configured element, or default bottom) ---

  watchTargetChanges() {
    this.mutationObserver = new MutationObserver(() => this.burstPositionLoop())
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })
  }

  // Runs for a short burst after a real trigger (scroll, resize, DOM
  // mutation) rather than continuously forever - a permanent per-frame
  // loop competes with the browser's own scroll compositing work.
  burstPositionLoop() {
    this.positionLoopDeadline = performance.now() + 400
    if (this.positionLoopId) return

    const loop = (now) => {
      this.checkButtonVisibility()
      this.updatePosition()
      if (now < this.positionLoopDeadline) {
        this.positionLoopId = requestAnimationFrame(loop)
      } else {
        this.positionLoopId = null
      }
    }
    this.positionLoopId = requestAnimationFrame(loop)
  }

  stopPositionLoop() {
    if (this.positionLoopId) cancelAnimationFrame(this.positionLoopId)
    this.positionLoopId = null
  }

  setDefaultPosition() {
    this.setAnchorState('bottom', '0px', '100%')
  }

  // Only writes to the DOM when a value actually changed, since setting
  // an unchanged style/attribute still costs a style recalculation.
  setAnchorState(anchor, offset, hideY) {
    if (this.dataset.anchor !== anchor) this.dataset.anchor = anchor
    if (this.lastOffset !== offset) {
      this.style.setProperty('--sticky-offset', offset)
      this.lastOffset = offset
    }
    if (this.lastHideY !== hideY) {
      this.style.setProperty('--sticky-hide-y', hideY)
      this.lastHideY = hideY
    }
  }

  updateContentPush(active) {
    const target = this.getContentPushTarget()
    if (!target) {
      this.currentPushAmount = 0
      return
    }

    if (active) {
      const height = `${this.offsetHeight}px`
      if (this.lastPushActive !== true || this.lastPushHeight !== height) {
        target.style.setProperty('padding-top', height)
        this.lastPushActive = true
        this.lastPushHeight = height
      }
      this.currentPushAmount = this.offsetHeight
    } else if (this.lastPushActive !== false) {
      target.style.removeProperty('padding-top')
      this.lastPushActive = false
      this.lastPushHeight = null
      this.currentPushAmount = 0
    }
  }

  updatePosition() {
    const selector = this.dataset.positionSelector
    if (!selector) {
      this.updateContentPush(false)
      this.setDefaultPosition()
      return
    }

    const targets = Array.from(document.querySelectorAll(selector)).filter(
      (el) => el.offsetParent !== null
    )
    if (targets.length === 0) {
      this.updateContentPush(false)
      this.setDefaultPosition()
      return
    }

    const placement = this.dataset.positionPlacement || 'above'

    if (placement === 'below') {
      // Clear every matched, visible element - not just whichever one the
      // selector happens to match first - so stacked sections (e.g. a
      // sticky header plus a banner directly beneath it) are both
      // accounted for instead of the bar landing on top of the second one.
      const bottoms = targets.map((t) => t.getBoundingClientRect().bottom).filter((b) => b > 0)
      if (bottoms.length === 0) {
        this.updateContentPush(false)
        this.setDefaultPosition()
        return
      }
      const lowestBottom = Math.max(...bottoms)
      this.setAnchorState('top', `${lowestBottom}px`, '-100%')
      this.updateContentPush(this.dataset.stuck === 'true')
    } else {
      const tops = targets.map((t) => t.getBoundingClientRect().top)
      const highestTop = Math.min(...tops)
      const offset = Math.max(window.innerHeight - highestTop, 0)
      this.setAnchorState('bottom', `${offset}px`, '100%')
      this.updateContentPush(false)
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