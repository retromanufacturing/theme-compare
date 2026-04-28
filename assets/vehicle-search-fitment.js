import { DATA as vehicleData } from "./vehicle-search-data.js";

class CurrentVehicleFitment extends HTMLElement {
  connectedCallback() {
    // Grab the link and text elements inside this custom element (if present)
    this.fitmentLink = this.querySelector('.js-ymm--fitment-link');
    this.fitmentText = this.querySelector('.js-ymm--fitment-text');

    // Store current fitment data safely (null if it doesn't exist)
    this.vehicleData = vehicleData?.currentFitment || null;

    // Trigger update to render fitment text into the DOM
    this.updateFitmentText()

    // Trigger update to render fitment link into the DOM
    this.updateFitmentLink()
  }

  // Compiles year, make, model into a single readable fitment string
  _getFitmentText(){
    // If no vehicle data exists, return empty string to prevent errors
    if (!this.vehicleData) return '';
   
    // Destructure values from the vehicle data object
    const { fitment, year, make, model } = this.vehicleData;

    // Prefer prebuilt "fitment" string if available,
    // otherwise construct it from year/make/model (ignoring empty values)
    return fitment || [year, make, model].filter(Boolean).join(' ');
  }

  _getFitmentLink(){
    // If no vehicle data exists, return empty string to prevent errors
    if (!this.vehicleData) return '';
   
    // Destructure values from the vehicle data object
    const { search, tags, params } = this.vehicleData;

    if (!search) return '';

    return `${search}${tags}${params || ''}`;
  }

  // Inserts fitment text into the DOM if current fitment exists
  updateFitmentText() {
    // If the target element doesn't exist, exit early
    if (!this.fitmentText) return;

    // Get the computed fitment string
    const text = this._getFitmentText();

    // If no valid text exists, do nothing
    if (!text) return;

    // Update the DOM with the fitment string
    this.fitmentText.textContent = text;
  }

  updateFitmentLink(){
    // If the target element doesn't exist, exit early
    if (!this.fitmentLink) return;

    // Get the computed fitment url
    const link = this._getFitmentLink()

    // If no valid link exists, do nothing
    if (!link) return;

    // Update the DOM with the fitment link
    this.fitmentLink.href = link;
  }

}

customElements.define('vehicle-search-fitment', CurrentVehicleFitment);