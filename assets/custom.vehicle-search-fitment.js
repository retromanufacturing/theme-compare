import { DATA as vehicleData } from "./custom.module.vehicle-search-data.js"
import { getFitmentText, getFitmentLink } from "./custom.module.vehicle-fitment.js"

class CurrentVehicleFitment extends HTMLElement {
  connectedCallback() {
    this.link = this.querySelector('.menu-link-list__link');
    this.vehicleData = vehicleData?.currentFitment || null;

    if (this._hasVehicleData()) {
      this.updateFitment();
    }
  }

  _hasVehicleData() {
    return !!this.vehicleData && Object.keys(this.vehicleData).length > 0;
  }

  updateFitment() {
    if (!this.link) return;

    const text = getFitmentText(this.vehicleData)
    const href = getFitmentLink(this.vehicleData, vehicleData.searchCollection)

    if (text) this.link.textContent = text;
    if (href) this.link.href = href;
  }
}

customElements.define('vehicle-search-fitment', CurrentVehicleFitment);