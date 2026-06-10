window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-index]')

    panels.forEach(panel => {
      if (panel.dataset.index !== '1') panel.setAttribute('aria-hidden', 'true')
    })

    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        console.log('change fired', input.value
        panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'))
        const activePanel = container.querySelector(`[data-index="${input.value}"]`)
        if (activePanel) activePanel.setAttribute('aria-hidden', 'false')
      })
    })
  })
})