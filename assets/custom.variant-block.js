// Listen for the next variantChange event and log what we'd use
document.addEventListener('variantChange', (e) => {
  const { html, variant, sectionId } = e.detail
  console.log('variant:', variant)
  console.log('sectionId:', sectionId)
  console.log('html:', html)
  
  if (html) {
    // Check what variant-features would find
    const source = html.querySelector(`variant-block[data-section-id="${sectionId}"]`)
    console.log('variant-features source found:', source)
    console.log('variant-features innerHTML:', source?.innerHTML)
  }
}, { once: true })