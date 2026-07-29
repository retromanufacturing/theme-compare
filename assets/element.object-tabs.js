window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-tab-index]')

    container.querySelectorAll('.object-child-tabs-wrap').forEach((set, i) => {
      if (i !== 0) set.setAttribute('aria-hidden', 'true')
    })

    const getActiveChildIndex = (tabIndex) => {
      const activeChildSet = container.querySelector(`.object-child-tabs-wrap[data-parent-index="${tabIndex}"]`)
      return activeChildSet?.querySelector('input[type="radio"]:checked')?.value ?? null
    }

    const updatePanelVisibility = (tabIndex) => {
      const childIndex = getActiveChildIndex(tabIndex)

      panels.forEach(panel => {
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

    container.querySelectorAll('.object-tabs-wrap input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
         console.log('childIndex:', getActiveChildIndex(input.value), '| panels:', [...panels].map(p => p.dataset.childIndex))
        container.querySelectorAll('.object-child-tabs-wrap').forEach(set => set.setAttribute('aria-hidden', 'true'))
        const activeChildSet = container.querySelector(`.object-child-tabs-wrap[data-parent-index="${input.value}"]`)
        if (activeChildSet) activeChildSet.setAttribute('aria-hidden', 'false')
        updatePanelVisibility(input.value)
      })
    })

    container.querySelectorAll('.object-child-tabs-wrap input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        const parentIndex = input.closest('.object-child-tabs-wrap').dataset.parentIndex
        updatePanelVisibility(parentIndex)
      })
    })
  })
})