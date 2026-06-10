window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-tab-index]')

    panels.forEach(panel => {
      if (panel.dataset.tabIndex !== '1') panel.setAttribute('aria-hidden', 'true')
    })

    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'))
        const activePanel = container.querySelector(`[data-tab-index="${input.value}"]`)
        if (!activePanel) return
        activePanel.setAttribute('aria-hidden', 'false')

        const gallery = activePanel.querySelector('product-images')
        if (gallery && gallery.flickity) {
            gallery.flickity.resize()
        } 
    })
    })
  })
})