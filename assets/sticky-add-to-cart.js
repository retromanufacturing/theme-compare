import { EVENTS } from 'util.events'

class StickyAddToCart extends HTMLElement {
  #isStuck = false
  #hiddenByBottom = false
  #buyButtonsObserver = null
  #footerObserver = null
  #abortController = null

  connectedCallback() {
    this.#abortController = new AbortController()
    const { signal } = this.#abortController

    this.bar = this.querySelector('.sticky-add-to-cart__bar')
    this.variantEl = this.querySelector('.sticky-add-to-cart__variant')
    this.priceEl = this.querySelector('.sticky-add-to-cart__price')
    this.button = this.querySelector('.sticky-add-to-cart__button')

    this.#setupObservers()

    const variantEvent = `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`
    document.addEventListener(variantEvent, this.#handleVariantChange.bind(this), { signal })

    document.addEventListener(EVENTS.ajaxProductAdded, this.#handleCartAdded.bind(this), { signal })
    document.addEventListener(EVENTS.ajaxProductError, this.#handleCartAdded.bind(this), { signal })

    this.button?.addEventListener('click', this.#handleClick.bind(this), { signal })
  }

  disconnectedCallback() {
    this.#abortController?.abort()
    this.#buyButtonsObserver?.disconnect()
    this.#footerObserver?.disconnect()
  }

  #getSection() {
    return this.closest('[id^="shopify-section-"]')
  }

  #getTargetBuyButtons() {
  return document.querySelector('block-buy-buttons')
}

 #getRealAddToCartButton() {
  return document.querySelector('block-buy-buttons')?.querySelector('[name="add"]')
}

  #setupObservers() {
    const buyButtons = this.#getTargetBuyButtons()
    if (!buyButtons) return

    const footer = document.querySelector('footer-section')
    if (!footer) return

    this.#buyButtonsObserver = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (!entry) return

      if (!entry.isIntersecting && !this.#isStuck) {
        const rect = entry.target.getBoundingClientRect()
        if (rect.bottom < 0) {
          this.#show()
        }
      } else if (entry.isIntersecting && this.#isStuck) {
        this.#hiddenByBottom = false
        this.#hide()
      }
    })

    this.#footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return

        if (entry.isIntersecting && this.#isStuck) {
          this.#hiddenByBottom = true
          this.#hide()
        } else if (!entry.isIntersecting && this.#hiddenByBottom) {
          const rect = buyButtons.getBoundingClientRect()
          if (rect.bottom < 0) {
            this.#hiddenByBottom = false
            this.#show()
          }
        }
      },
      { rootMargin: '200px 0px 0px 0px' }
    )

    this.#buyButtonsObserver.observe(buyButtons)
    this.#footerObserver.observe(footer)
  }

  #show() {
    this.#isStuck = true
    this.bar?.setAttribute('data-stuck', 'true')
  }

  #hide() {
    this.#isStuck = false
    this.bar?.setAttribute('data-stuck', 'false')
  }

  #handleClick() {
    const realButton = this.#getRealAddToCartButton()
    if (!realButton || realButton.disabled) return
    realButton.click()
    this.button.setAttribute('aria-busy', 'true')
    this.button.classList.add('btn--loading')
  }

  #handleCartAdded() {
    this.button?.removeAttribute('aria-busy')
    this.button?.classList.remove('btn--loading')
  }

  #handleVariantChange({ detail }) {
    const { variant, html } = detail

    if (!variant) {
      this.dataset.variantAvailable = 'false'
      this.button?.setAttribute('disabled', 'disabled')
      return
    }

    this.dataset.variantId = variant.id
    this.dataset.variantAvailable = variant.available ? 'true' : 'false'

    if (variant.available) {
      this.button?.removeAttribute('disabled')
    } else {
      this.button?.setAttribute('disabled', 'disabled')
    }

    if (this.variantEl) {
      this.variantEl.textContent = variant.title === 'Default Title' ? '' : variant.title
    }

    if (html && this.priceEl) {
      const updatedPrice = html.querySelector('.sticky-add-to-cart__price')
      if (updatedPrice) {
        this.priceEl.innerHTML = updatedPrice.innerHTML
      }
    }

    const img = this.querySelector('.sticky-add-to-cart__image img')
    if (img && variant.featured_image) {
      img.src = variant.featured_image.src
      img.alt = variant.featured_image.alt || ''
    }
  }
}

customElements.define('sticky-add-to-cart', StickyAddToCart)