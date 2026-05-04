import { EVENTS } from 'util.events'

class CartSlideout extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    const { signal } = this.abortController

    this.drawer = document.getElementById('cart-slideout')

    // Open on cart icon click
    document.addEventListener(EVENTS.cartOpen, this.#handleOpen.bind(this), { signal })

    // Close on cart:close
    document.addEventListener(EVENTS.cartClose, this.#handleClose.bind(this), { signal })

    // Bridge overlay.drawer events to EVENTS.headerDrawerOpened/Closed
    // so toggle-cart can track aria-expanded state correctly
    this.drawer?.addEventListener('drawer:after-show', this.#handleAfterShow.bind(this), { signal })
    this.drawer?.addEventListener('drawer:after-hide', this.#handleAfterHide.bind(this), { signal })
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  #handleOpen() {
    this.drawer?.show()
  }

  #handleClose() {
    this.drawer?.hide()
  }

  #handleAfterShow(evt) {
    this.dispatchEvent(new CustomEvent(EVENTS.headerDrawerOpened, {
      bubbles: true,
      detail: evt.detail
    }))
  }

  #handleAfterHide() {
    this.dispatchEvent(new CustomEvent(EVENTS.headerDrawerClosed, { bubbles: true }))
  }
}

customElements.define('cart-slideout', CartSlideout)