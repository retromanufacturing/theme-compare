import { EVENTS } from 'util.events'

class CartSlideout extends HTMLElement {
  get drawer() {
    return document.getElementById('cart-slideout')
  }

  connectedCallback() {
    this.abortController = new AbortController()
    const { signal } = this.abortController

    // Set open attribute so toggle-cart can track open state correctly
    this.setAttribute('open', EVENTS.cartOpen)

    // Open on cart icon click
    document.addEventListener(EVENTS.cartOpen, this.#handleOpen.bind(this), { signal })

    // Close on cart:close
    document.addEventListener(EVENTS.cartClose, this.#handleClose.bind(this), { signal })

    // Bridge overlay.drawer events to EVENTS.headerDrawerOpened/Closed
    // so toggle-cart can track aria-expanded state correctly
    document.addEventListener('drawer:after-show', this.#handleAfterShow.bind(this), { signal })
    document.addEventListener('drawer:after-hide', this.#handleAfterHide.bind(this), { signal })
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
    if (evt.target?.id !== 'cart-slideout') return
    this.dispatchEvent(new CustomEvent(EVENTS.headerDrawerOpened, {
      bubbles: true,
      detail: evt.detail
    }))
  }

  #handleAfterHide(evt) {
    if (evt.target?.id !== 'cart-slideout') return
    this.dispatchEvent(new CustomEvent(EVENTS.headerDrawerClosed, { bubbles: true }))
  }
}

customElements.define('cart-slideout', CartSlideout)