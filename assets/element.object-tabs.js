window.addEventListener('load', () => {
  document.querySelectorAll('.object-tabs-wrap').forEach(tabs => {
    const container = tabs.closest('[class*="tabbed"]')
    if (!container) return

    // Hide all panels except the first on load
    container.querySelectorAll('[data-index]').forEach(panel => {
      if (panel.dataset.index !== '1') {
        panel.classList.add('hide')
      }
    })

    tabs.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        container.querySelectorAll('[data-index]').forEach(panel => {
          panel.classList.add('hide')
        })
        const activePanel = container.querySelector(`[data-index="${input.value}"]`)
        if (activePanel) activePanel.classList.remove('hide')
      })
    })
  })
})