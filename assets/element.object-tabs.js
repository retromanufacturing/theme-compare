window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-tab-index]')

    panels.forEach(panel => {
      if (panel.dataset.tabIndex !== '1') panel.setAttribute('aria-hidden', 'true')
    })

    container.querySelectorAll('.object-child-tabs-wrap').forEach((set, i) => {
      if (i !== 0) set.setAttribute('aria-hidden', 'true')
    })

    const tabSelectors = [
      {
        selector: '.object-tabs-wrap input[type="radio"]',
        panelAttribute: 'data-tab-index',
        onActivate: (value) => {
          container.querySelectorAll('.object-child-tabs-wrap').forEach(set => set.setAttribute('aria-hidden', 'true'))
          const activeChildSet = container.querySelector(`.object-child-tabs-wrap[data-parent-index="${value}"]`)
          if (activeChildSet) activeChildSet.setAttribute('aria-hidden', 'false')
        }
      },
      { selector: '.object-child-tabs-wrap input[type="radio"]', panelAttribute: 'data-child-index' }
    ]

    tabSelectors.forEach(({ selector, panelAttribute, onActivate }) => {
      container.querySelectorAll(selector).forEach(input => {
        input.addEventListener('change', () => {
          panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'))
          const activePanels = container.querySelectorAll(`[${panelAttribute}="${input.value}"]`)
          activePanels.forEach(panel => {
            panel.setAttribute('aria-hidden', 'false')
            const gallery = panel.querySelector('product-images')
            if (gallery && gallery.flickity) gallery.flickity.resize()
          })
          if (onActivate) onActivate(input.value)
        })
      })
    })
  })
})