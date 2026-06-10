window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-index]')

    panels.forEach(panel => {
      if (panel.dataset.index !== '1') {
        panel.classList.add('hide')
      }
    })

    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        // panels.forEach(panel => panel.classList.add('hide'))
        const activePanel = container.querySelector(`[data-index="${input.value}"]`)
        if (activePanel) activePanel.classList.remove('hide')
      })
    })
  })
})