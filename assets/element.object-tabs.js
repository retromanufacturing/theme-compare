window.addEventListener('load', () => {
  document.querySelectorAll('object-tabs').forEach(container => {
    const panels = container.querySelectorAll('[data-tab-index]')

    panels.forEach(panel => {
      if (panel.dataset.tabIndex !== '1') panel.setAttribute('aria-hidden', 'true')
    })

    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        console.log('change fired', input.value)
        console.log('panel found', container.querySelector(`[data-tab-index="${input.value}"]`))
        panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'))
        const activePanel = container.querySelector(`[data-tab-index="${input.value}"]`)
        if (activePanel) activePanel.setAttribute('aria-hidden', 'false')
      })
    })
  })
})