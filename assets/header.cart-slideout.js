import { EVENTS } from 'util.events'

class CartSlideout extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    const { signal } = this.abortController

    this.setAttribute('open', EVENTS.cartOpen)
    this.setAttribute('close', EVENTS.cartClose)

    document.addEventListener(EVENTS.cartOpen, this.#handleOpen.bind(this), { signal })
    document.addEventListener(EVENTS.cartClose, this.#handleClose.bind(this), { signal })
    document.addEventListener(EVENTS.ajaxProductAdded, this.#handleProductAdded.bind(this), { signal })

    const drawer = this.#getDrawer()
    if (drawer) {
      drawer.addEventListener('drawer:after-show', this.#handleAfterShow.bind(this), { signal })
      drawer.addEventListener('drawer:after-hide', this.#handleAfterHide.bind(this), { signal })
    }
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  #getDrawer() {
    return document.getElementById('cart-slideout')
  }

  #handleOpen() {
    this.#getDrawer()?.show()
  }

  #handleClose() {
    this.#getDrawer()?.hide()
  }

  #handleProductAdded(evt) {
    if (evt?.detail?.preventCartOpen) return
    this.#getDrawer()?.show()
  }

  #handleAfterShow() {
    this.dispatchEvent(new CustomEvent(EVENTS.headerDrawerOpened, { bubbles: true }))
  }

  #handleAfterHide() {
    this.dispatchEvent(new CustomEvent(EVENTS.headerDrawerClosed, { bubbles: true }))
  }
}

customElements.define('cart-slideout', CartSlideout)