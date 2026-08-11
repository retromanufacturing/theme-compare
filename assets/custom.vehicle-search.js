import { DATA as vehicleData } from "./custom.module.vehicle-search-data.js"

class VehicleSelector extends HTMLElement  { 
  constructor(vehicleData) {
    super();
    this.vehicleData = vehicleData   
  }

  connectedCallback() {  
    this.yearSelect = this.querySelector('.js-ymm--year')
    this.makeSelect  = this.querySelector('.js-ymm--make')
    this.modelSelect  = this.querySelector('.js-ymm--model')
    this.searchBtn = this.querySelector(".js-ymm--search")
    this.resetBtn = this.querySelector(".js-ymm--reset")

    this.populateYears()

    this.yearSelect.addEventListener("change", () => this.onYearChange())
    this.makeSelect.addEventListener("change", () => this.onMakeChange())
    this.modelSelect.addEventListener("change", () => this.onModelChange())
    this.searchBtn.addEventListener("click", () => this.onSearch())
    this.resetBtn.addEventListener("click", () => this.onReset())
    this.addEventListener("custom:searchFitment", this.onFitmentSearch) 
  }

  disconnectedCallback() {  
    this.yearSelect.removeEventListener("change", this._onYearChange);
    this.makeSelect.removeEventListener("change", this._onMakeChange);
    this.modelSelect.removeEventListener("change", this._onModelChange);
    this.searchBtn.removeEventListener("click", this._onSearch);
    this.resetBtn.removeEventListener("click", this._onReset);
    this.removeEventListener("custom:searchFitment", this.onFitmentSearch);
  }

  // Adds placeholder text for each vehicle fitment dropdown 
  _addPlaceholder(select, text) {       
    const placeholder = document.createElement('option')     
    placeholder.value = ''       
    placeholder.textContent = text       
    placeholder.disabled = true       
    placeholder.selected = true      
    select.appendChild(placeholder)    
  }

  // Utility: Get unique, non-empty values for a given key
  _getUniqueSorted(arr, key) {
    return [...new Set(arr.map(item => item[key]).filter(value => value !== '' && value != null))]
      .sort((a, b) => a.localeCompare(b))
  }

  // Utility: Populate a select element with given options
  _addSelectOptions(select, options, placeholderText) {
    select.innerHTML = ''
    this._addPlaceholder(select, placeholderText)
    options.forEach(opt => {
      const option = document.createElement("option")
      option.value = opt
      option.textContent = opt
      select.appendChild(option)
    });
    select.disabled = options.length === 0
  }

  // Utility: Enable/disable elements
  enableElement(element) { element.disabled = false }
  disableElement(element) { element.disabled = true }

  populateYears() {
    const years = this._getUniqueSorted(vehicleData.fitments, 'year')
    this._addSelectOptions(this.yearSelect, years, 'Select Year')
    this.disableElement(this.makeSelect)
    this.disableElement(this.modelSelect)
    this.disableElement(this.searchBtn)
  }
   
  onYearChange() {
    const selectedYear = this.yearSelect.value    
    const fitmentsByYear = vehicleData.fitments.filter(fitment => fitment.year === selectedYear)       
    const makes = this._getUniqueSorted(fitmentsByYear, 'make')
    
    this._addSelectOptions(this.makeSelect, makes, 'Select Make')
    this.disableElement(this.modelSelect);
    this.disableElement(this.searchBtn)   
  } 

   onMakeChange() {
     const selectedYear = this.yearSelect.value
     const selectedMake = this.makeSelect.value
     const fitmentsByYearMake = vehicleData.fitments.filter(fitment => fitment.make === selectedMake && fitment.year === selectedYear)
     const models = this._getUniqueSorted(fitmentsByYearMake, 'model')

     this._addSelectOptions(this.modelSelect, models, 'Select Model')
     this.disableElement(this.searchBtn)     
   }
  
  onModelChange() {      
    const year = this.yearSelect.value    
    const make = this.makeSelect.value    
    const model = this.modelSelect.value
    
    this.searchBtn.disabled = !(year && make && model)      
  }

  onSearch() {
    const year = this.yearSelect.value
    const make = this.makeSelect.value
    const model = this.modelSelect.value
    
    const event = new CustomEvent("custom:searchFitment", {
      detail: { year, make, model },
      bubbles: true,
      composed: true
    })
    
    this.dispatchEvent(event)
  }
  
  onReset() {  
    this.populateYears()
    
    // Optionally, clear selects and selections
    this.makeSelect.innerHTML = ''
    this.modelSelect.innerHTML = ''
    this.disableElement(this.makeSelect)
    this.disableElement(this.modelSelect)
    this.disableElement(this.searchBtn)
  }

   onFitmentSearch(event) {
    const { year, make, model } = event.detail
    const search = this._buildFitmentDetail(year, make, model)
    this._addCurrentFitment(search) 
    
    this.searchFitment({
      year: search.year,
      make: search.make,
      model: search.model,
      collection: search.tags,
      params: search.query
    })    
  }
   
  _buildFitmentDetail(year, make, model) {
    return {   
      year,   
      make,  
      model,  
      search: vehicleData.searchCollection,
      tags: `${year}+${make}+${model}`.replace(/[ /]/g, "-"),
      query: `?rq=yr_${year}~mk_${make}~md_${model}`,
      fitment: `${year} ${make} ${model}`
    }
  }
   
  _addCurrentFitment({ year, make, model, tags, query }) {
     // Store fitment details in localStorage with new property names
     const fitmentObj = { 
       year,
       make,
       model,
       collection: tags,
       params: query
     }
 
     localStorage.setItem("vehicleFitment", JSON.stringify(fitmentObj)) 
     vehicleData.currentFitment = fitmentObj
  }

  searchFitment({ year, make, model, collection, params }){       
    const url = `${vehicleData.searchCollection}${collection}${params}`;
    window.location.href = url;
  }
  
}

customElements.define("vehicle-search-selector", VehicleSelector)