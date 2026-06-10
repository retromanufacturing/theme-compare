window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-index]')
    const galleries = container.querySelectorAll('product-images')
    let initializedCount = 0

    galleries.forEach(gallery => {
      gallery.addEventListener('product-images:updateImageSet', () => {
        initializedCount++
        if (initializedCount === galleries.length) {
          panels.forEach(panel => {
            if (panel.dataset.index !== '1') {
              panel.classList.add('hide')
            }
          })
        }
      })
    })

    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        panels.forEach(panel => panel.classList.add('hide'))
        const activePanel = container.querySelector(`[data-index="${input.value}"]`)
        if (activePanel) activePanel.classList.remove('hide')
      })
    })
  })
})