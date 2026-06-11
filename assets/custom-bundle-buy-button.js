class BundleBuyButton extends HTMLElement {
  connectedCallback() {
    this.querySelector('.bundle-add-to-cart').addEventListener('click', this.handleClick.bind(this))
  }

  handleClick() {
    const sectionId = this.dataset.sectionId
    const items = []

    // Main product variant
    const mainPicker = document.querySelector(`block-variant-picker[data-section-id="${sectionId}"]`)
    if (mainPicker) {
      const checkedInput = mainPicker.querySelector('input[type="radio"]:checked')
      if (checkedInput) items.push({ id: parseInt(checkedInput.value), quantity: 1 })
    }

    // Required object-tabs — add active visible panel's checked variant
    document.querySelectorAll(`object-tabs[data-required="true"]`).forEach(tabs => {
      const visiblePanel = tabs.querySelector('[data-tab-index]:not([aria-hidden="true"])')
      if (!visiblePanel) return
      const picker = visiblePanel.querySelector('block-variant-picker')
      if (!picker) return
      const checked = picker.querySelector('input[type="radio"]:checked')
      if (checked) items.push({ id: parseInt(checked.value), quantity: 1 })
    })

    // Optional object-tabs — add only the customer-selected panel's checked variant
    document.querySelectorAll(`object-tabs[data-required="false"]`).forEach(tabs => {
      const selectedPanel = tabs.querySelector('[data-tab-index][data-optional-selected]')
      if (!selectedPanel) return
      const picker = selectedPanel.querySelector('block-variant-picker')
      if (!picker) return
      const checked = picker.querySelector('input[type="radio"]:checked')
      if (checked) items.push({ id: parseInt(checked.value), quantity: 1 })
    })

    if (items.length === 0) return

    this.setLoading(true)

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    })
      .then(res => res.json())
      .then(() => {
        if (this.dataset.cartType === 'drawer') {
          document.dispatchEvent(new CustomEvent('cart:open'))
        } else {
          window.location.href = '/cart'
        }
      })
      .catch(err => console.error('Bundle add to cart error:', err))
      .finally(() => this.setLoading(false))
  }

  setLoading(state) {
    const btn = this.querySelector('.bundle-add-to-cart')
    if (state) {
      btn.setAttribute('disabled', 'disabled')
    } else {
      btn.removeAttribute('disabled')
    }
  }
}

customElements.define('bundle-buy-button', BundleBuyButton)