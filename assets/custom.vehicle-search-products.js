import { DATA as vehicleData } from 'vehicle-search-data'

class FitmentProductGrid extends HTMLElement {
  async connectedCallback() {
    const fitment = vehicleData?.currentFitment
    if (!fitment?.collection) {
      this.remove()
      return
    }

    const url = `${vehicleData.searchCollection}${fitment.collection}${encodeURI(fitment.params || '')}`

    try {
      const response = await fetch(url)
      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const grid = doc.querySelector('.new-grid.product-grid.collection-grid')

      if (grid) {
        this.querySelector('.fitment-product-grid__results').replaceWith(grid)
      } else {
        this.remove()
      }
    } catch (error) {
      console.error('Fitment product grid error:', error)
      this.remove()
    }
  }
}

customElements.define('fitment-product-grid', FitmentProductGrid)