import { EVENTS } from 'util.events'

class AccessoryVisibility extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    this.lookup = JSON.parse(document.getElementById(this.dataset.scriptId)?.textContent || '{}')
    this.allRestrictedIds = [...new Set(Object.values(this.lookup).flat())]
    this.allowedIds = this.lookup[this.dataset.currentVariantId] || []

    // Some item sources (like third-party app widgets) inject their DOM
    // asynchronously after this element has already connected - calling
    // update() immediately would find nothing yet. If a ready-callback name
    // is configured, expose update() through that global instead, so the
    // source can trigger it once its items actually exist. Otherwise (e.g.
    // server-rendered content already present), just run it now.
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