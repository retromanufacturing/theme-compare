class DimensionsFinder extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    const { signal } = this.abortController

    this.tolerance = (Number(this.dataset.tolerancePercent) || 0) / 100
    this.conversionUnit = 1
    this.matchedProducts = []

    this.instructions = this.querySelector('[data-dimensions-instructions]')
    this.results = this.querySelector('[data-dimensions-results]')
    this.noResults = this.querySelector('[data-dimensions-no-results]')
    this.hiddenFields = this.querySelectorAll('[data-dimensions-hidden-fields]')
    this.hiddenInputs = this.querySelectorAll('[data-dimensions-hidden-input]')
    this.products = this.querySelectorAll('[data-width][data-height]')

    this.widthInput = this.querySelector('[data-dimensions-width]')
    this.heightInput = this.querySelector('[data-dimensions-height]')
    this.calculateButton = this.querySelector('[data-dimensions-calculate]')
    this.recalculateButton = this.querySelector('[data-dimensions-recalculate]')
    this.unitInputs = this.querySelectorAll('[data-dimensions-unit]')

    this.unitInputs.forEach((unit) => {
      unit.addEventListener(
        'change',
        () => {
          this.conversionUnit = unit.value === 'inches' ? 25.4 : 1
        },
        { signal }
      )
    })

    this.widthInput.addEventListener('change', this.updateCalculateState.bind(this), { signal })
    this.heightInput.addEventListener('change', this.updateCalculateState.bind(this), { signal })
    this.calculateButton.addEventListener('click', this.handleCalculate.bind(this), { signal })
    this.recalculateButton?.addEventListener('click', this.handleRecalculate.bind(this), { signal })

    this.updateCalculateState()
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

 updateCalculateState() {
  const isDisabled = !(this.widthInput.value && this.heightInput.value)
  this.calculateButton.disabled = isDisabled
  this.calculateButton.classList.toggle('kit-button--disabled', isDisabled)
}

  calculateDimensions(width, height) {
    const maxWidth = width * this.conversionUnit
    const maxHeight = height * this.conversionUnit
    const minWidth = maxWidth - maxWidth * this.tolerance
    const minHeight = maxHeight - maxHeight * this.tolerance

    this.matchedProducts = []

    this.products.forEach((product) => {
      const productWidth = Number(product.dataset.width)
      const productHeight = Number(product.dataset.height)
      const isMatch =
        productWidth <= maxWidth && productWidth >= minWidth && productHeight <= maxHeight && productHeight >= minHeight

      product.classList.toggle('hide', !isMatch)
      if (isMatch) this.matchedProducts.push(product)
    })
  }

  validateResults() {
    const hasMatches = this.matchedProducts.length > 0

    this.results.classList.toggle('hide', !hasMatches)
    this.noResults.classList.toggle('hide', hasMatches)
    this.calculateButton.classList.toggle('hide', !hasMatches)
    this.hiddenFields.forEach((field) => field.classList.toggle('hide', hasMatches))
    this.hiddenInputs.forEach((input) => {
      if (hasMatches) {
        input.removeAttribute('required')
      } else {
        input.setAttribute('required', '')
      }
    })
  }

  handleCalculate() {
    if (!(this.widthInput.value && this.heightInput.value)) return

    this.results.classList.remove('hide')
    this.instructions.classList.add('hide')
    this.calculateDimensions(Number(this.widthInput.value), Number(this.heightInput.value))
    this.validateResults()
    window.scrollTo(0, 0)
  }

  handleRecalculate() {
    this.instructions.classList.remove('hide')
    this.results.classList.remove('hide')
    this.noResults.classList.add('hide')
    this.calculateButton.classList.remove('hide')
    this.hiddenFields.forEach((field) => field.classList.add('hide'))
    this.hiddenInputs.forEach((input) => input.removeAttribute('required'))
  }
}

customElements.define('dimensions-finder', DimensionsFinder)