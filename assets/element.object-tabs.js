document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.object-tabs-wrap input[type="radio"]').forEach(input => {
    if (input.checked) {
      const panel = getPanel(input)
      resizeGallery(panel)
    }

    input.addEventListener('change', () => {
      const panel = getPanel(input)
      setTimeout(() => resizeGallery(panel), 50)
    })
  })
})

function getPanel(input) {
  const index = input.value
  const container = input.closest('[class*="tabbed"]')
  if (!container) return null
  return container.querySelector(`[data-index="${index}"]`)
}

function resizeGallery(panel) {
  if (!panel) return
  const gallery = panel.querySelector('product-images')
  if (gallery && gallery.flickity) {
    gallery.flickity.resize()
  }
}