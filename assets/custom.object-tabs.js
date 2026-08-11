class ObjectTabs extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    this.querySelectorAll('.object-child-tabs-wrap').forEach((set, i) => {
      if (i !== 0) set.setAttribute('aria-hidden', 'true')
    })

    this.querySelectorAll('.bundle-optional-radio').forEach(radio => {
      if (radio.checked) {
        const panel = this.querySelector(`[data-tab-index="${radio.dataset.panelIndex}"]`)
        if (panel) panel.setAttribute('data-optional-selected', '')
      }
      radio.addEventListener('change', () => {
        this.querySelectorAll('[data-tab-index]').forEach(p => p.removeAttribute('data-optional-selected'))
        const panel = this.querySelector(`[data-tab-index="${radio.dataset.panelIndex}"]`)
        if (panel) panel.setAttribute('data-optional-selected', '')
      }, { signal })
    })

    this.querySelectorAll('.object-tabs-wrap input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        this.querySelectorAll('.object-child-tabs-wrap').forEach(set => set.setAttribute('aria-hidden', 'true'))
        const activeChildSet = this.querySelector(`.object-child-tabs-wrap[data-parent-index="${input.value}"]`)
        if (activeChildSet) activeChildSet.setAttribute('aria-hidden', 'false')
        this.updatePanelVisibility(input.value)
      }, { signal })
    })

    this.querySelectorAll('.object-child-tabs-wrap input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        const parentIndex = input.closest('.object-child-tabs-wrap').dataset.parentIndex
        this.updatePanelVisibility(parentIndex)
      }, { signal })
    })
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  getActiveChildIndex(tabIndex) {
    const activeChildSet = this.querySelector(`.object-child-tabs-wrap[data-parent-index="${tabIndex}"]`)
    return activeChildSet?.querySelector('input[type="radio"]:checked')?.value ?? null
  }

  updatePanelVisibility(tabIndex) {
    const childIndex = this.getActiveChildIndex(tabIndex)

    this.querySelectorAll('[data-tab-index]').forEach(panel => {
      const matchesTab = panel.dataset.tabIndex === tabIndex
      const matchesChild = !panel.dataset.childIndex || childIndex === null || panel.dataset.childIndex === childIndex
      const visible = matchesTab && matchesChild

      panel.setAttribute('aria-hidden', visible ? 'false' : 'true')

      if (visible) {
        const gallery = panel.querySelector('product-images')
        if (gallery && gallery.flickity) gallery.flickity.resize()
      }
    })
  }
}

customElements.define('object-tabs', ObjectTabs)