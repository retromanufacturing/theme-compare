window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-tab-index]')

    panels.forEach(panel => {
      if (panel.dataset.tabIndex !== '1') panel.setAttribute('aria-hidden', 'true')
    })

    container.querySelectorAll('.object-tabs-wrap input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'))
        const activePanels = container.querySelectorAll(`[data-tab-index="${input.value}"]`)
        activePanels.forEach(panel => {
            panel.setAttribute('aria-hidden', 'false')
            const gallery = panel.querySelector('product-images')
            if (gallery && gallery.flickity) gallery.flickity.resize()
            })
        })
    })
  })
})