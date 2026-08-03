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

  // Updates heading to include current fitment
  updateHeading(fitment) {
    const heading = this.querySelector('h2')
    if (heading) heading.textContent = heading.textContent.replace('{vehicle}', fitment.fitment)
  }

  // Updates view all link to filtered vehicle fitment collection url
  updateViewAllLink(url) {
    const link = this.querySelector('.fitment-view-all')
    if (link) link.href = url
  }

  // Sets the amount of products shown based on section setting value
  trimToLimit(grid) {
    const limit = parseInt(this.dataset.limit)
    const items = grid.querySelectorAll('.grid-item')
    items.forEach((item, index) => {
      if (index >= limit) item.remove()
    })
  }

  // On product page, filters out products that share the same product.type
  filterByType(grid) {
    const currentType = this.dataset.currentType
    if (!currentType) return

    grid.querySelectorAll('[data-product-type]').forEach((card) => {
      if (card.dataset.productType === currentType) {
        card.closest('.grid-item')?.remove()
      }
    })
  }

}

customElements.define('fitment-product-grid', FitmentProductGrid)