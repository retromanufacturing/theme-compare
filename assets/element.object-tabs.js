window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-tab-index]')

    panels.forEach(panel => {
      if (panel.dataset.tabIndex !== '1') panel.setAttribute('aria-hidden', 'true')
    })

    const tabSelectors = [
      { selector: '.object-tabs-wrap input[type="radio"]', panelAttribute: 'data-tab-index' },
      { selector: '.object-child-tabs-wrap input[type="radio"]', panelAttribute: 'data-child-index' }
    ]

    tabSelectors.forEach(({ selector, panelAttribute }) => {
      container.querySelectorAll(selector).forEach(input => {
        input.addEventListener('change', () => {
          panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'))
          const activePanels = container.querySelectorAll(`[${panelAttribute}="${input.value}"]`)
          activePanels.forEach(panel => {
            panel.setAttribute('aria-hidden', 'false')
            const gallery = panel.querySelector('product-images')
            if (gallery && gallery.flickity) gallery.flickity.resize()
          })
        })
      })
    })
  })
})