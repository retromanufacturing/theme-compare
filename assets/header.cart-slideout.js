import { EVENTS } from 'util.events'

class CartSlideout extends HTMLElement {
  #summaryThreshold = 0.5
  #historyAbortController = null

  connectedCallback() {
    this.abortController = new AbortController()
    const { signal } = this.abortController

    this.overlayDrawer = this.querySelector('overlay-drawer')
    this.dialog = this.querySelector('dialog')

    // Open on cart icon click
    document.addEventListener(EVENTS.cartOpen, this.#handleCartOpen.bind(this), { signal })

    // Open on add to cart
    document.addEventListener(EVENTS.ajaxProductAdded, this.#handleCartAdd.bind(this), { signal })

    // Sync cart:close when drawer hides
    this.overlayDrawer?.addEventListener('drawer:after-hide', this.#handleAfterHide.bind(this), { signal })

    // Sticky summary + installments conflict on drawer open
    this.overlayDrawer?.addEventListener('drawer:after-show', this.#handleAfterShow.bind(this), { signal })

    // Update sticky state on cart update
    document.addEventListener(EVENTS.cartUpdated, this.#updateStickyState.bind(this), { signal })

    // Clean up stale history state on load
    if (history.state?.cartSlideoutOpen) {
      history.replaceState(null, '')
    }
  }

  disconnectedCallback() {
    this.abortController.abort()
    this.#historyAbortController?.abort()
  }

  #handleCartOpen() {
    this.overlayDrawer?.show()
  }

  #handleCartAdd(evt) {
    if (evt?.detail?.preventCartOpen) return
    this.overlayDrawer?.show()
    this.#announceCartCount(evt.detail?.product?.item_count)
  }

  #handleAfterShow() {
    this.#handleHistoryOpen()
    this.#updateStickyState()
    this.#handleInstallments()
  }

  #handleAfterHide() {
    this.#historyAbortController?.abort()
    document.dispatchEvent(new CustomEvent(EVENTS.cartClose, { bubbles: true }))

    if (history.state?.cartSlideoutOpen) {
      history.back()
    }
  }

  #handleHistoryOpen() {
    if (window.innerWidth >= 768) return
    if (history.state?.cartSlideoutOpen) return

    history.pushState({ cartSlideoutOpen: true }, '')

    this.#historyAbortController = new AbortController()
    window.addEventListener('popstate', this.#handlePopState.bind(this), {
      signal: this.#historyAbortController.signal
    })
  }

  #handlePopState() {
    if (this.dialog?.open) {
      this.overlayDrawer?.hide()
    }
  }

  #announceCartCount(itemCount) {
    if (!this.dialog?.open || itemCount === undefined) return
    const liveRegion = this.querySelector('.cart-slideout__live-region')
    if (!liveRegion) return
    liveRegion.textContent = `Cart: ${itemCount} item${itemCount === 1 ? '' : 's'}`
  }

  #updateStickyState() {
    if (!this.dialog) return

    const scrollable = this.dialog.querySelector('.cart-slideout__scrollable')
    const footer = this.dialog.querySelector('.cart-slideout__footer')

    if (!scrollable || !footer) {
      this.dialog.setAttribute('cart-summary-sticky', 'false')
      return
    }

    const drawerHeight = this.dialog.getBoundingClientRect().height
    const footerHeight = footer.getBoundingClientRect().height
    const ratio = footerHeight / drawerHeight
    this.dialog.setAttribute('cart-summary-sticky', ratio > this.#summaryThreshold ? 'false' : 'true')
  }

  #handleInstallments() {
    customElements.whenDefined('shopify-payment-terms').then(() => {
      const installmentsContent = document.querySelector('shopify-payment-terms')?.shadowRoot
      const cta = installmentsContent?.querySelector('#shopify-installments-cta')
      cta?.addEventListener('click', () => this.overlayDrawer?.hide(), { once: true })
    })
  }
}

customElements.define('header-cart-slideout', CartSlideout)