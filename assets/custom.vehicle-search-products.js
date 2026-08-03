import { DATA as vehicleData } from "./vehicle-search-data.js"

class FitmentProductGrid extends HTMLElement {
  async connectedCallback() {
    const fitment = vehicleData?.currentFitment
    if (!fitment?.collection) {
      this.remove()
      return
    }

    const url = `${vehicleData.searchCollection}${fitment.collection}${encodeURI(fitment.params || '')}`

    this.updateViewAllLink(url)

    try {
      const response = await fetch(url)
      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const grid = doc.querySelector('.new-grid.product-grid.collection-grid')

      if (grid) {
        this.trimToLimit(grid)
        this.querySelector('.fitment-product-grid__results').replaceWith(grid)
      } else {
        this.remove()
      }
    } catch (error) {
      console.error('Fitment product grid error:', error)
      this.remove()
    }
  }

  updateViewAllLink(url) {
    const link = this.querySelector('.section-header__link')
    if (link) link.href = url
  }

  trimToLimit(grid) {
    const limit = parseInt(this.dataset.limit)
    const items = grid.querySelectorAll('.grid-item')
    items.forEach((item, index) => {
      if (index >= limit) item.remove()
    })
  }
}

customElements.define('fitment-product-grid', FitmentProductGrid)