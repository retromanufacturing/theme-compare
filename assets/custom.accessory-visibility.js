import { EVENTS } from 'util.events'

class AccessoryVisibility extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    this.lookup = JSON.parse(document.getElementById(this.dataset.scriptId)?.textContent || '{}')
    this.allRestrictedIds = [...new Set(Object.values(this.lookup).flat())]
    this.allowedIds = this.lookup[this.dataset.currentVariantId] || []

    // The accessories app adds its products to the page a moment after
    // everything else has loaded. If we checked which ones to hide right
    // away, they wouldn't exist yet. So if a "ready callback" name is set,
    // we wait for the app to tell us it's actually finished before checking
    // anything. If no callback is set, the products are already there from
    // the start, so we just check right away.
    if (this.dataset.readyCallback) {
      window[this.dataset.readyCallback] = () => this.update()
    } else {
      this.update()
    }

    document.addEventListener(
      `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
      (event) => {
        if (!event.detail.variant || event.detail.loading) return
        this.allowedIds = this.lookup[event.detail.variant.id] || []
        this.update()
      },
      { signal: this.abortController.signal }
    )
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  update() {
    document.querySelectorAll(this.dataset.itemSelector).forEach((item) => {
      const idSource = this.dataset.idSelector === 'self' ? item : item.querySelector(this.dataset.idSelector)
      const id = Number(idSource?.getAttribute(this.dataset.idAttribute))
      const isRestricted = this.allRestrictedIds.includes(id)
      const isAllowed = this.allowedIds.includes(id)
      item.classList.toggle(this.dataset.hiddenClass || 'hide', isRestricted && !isAllowed)
    })
  }
}

customElements.define('accessory-visibility', AccessoryVisibility)