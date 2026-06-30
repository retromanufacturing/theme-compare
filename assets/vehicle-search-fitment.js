import { DATA as vehicleData } from "./vehicle-search-data.js";

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

  _getFitmentText() {
    const { fitment, year, make, model } = this.vehicleData;
    return fitment || [year, make, model].filter(Boolean).join(' ');
  }

  _getFitmentLink() {
    const { search, tags, params } = this.vehicleData;
    if (!search) return '';
    return `${search}${tags}${params || ''}`;
  }

  updateFitment() {
    if (!this.link) return;

    const text = this._getFitmentText();
    const href = this._getFitmentLink();

    if (text) this.link.textContent = text;
    if (href) this.link.href = href;
  }
}

customElements.define('vehicle-search-fitment', CurrentVehicleFitment);