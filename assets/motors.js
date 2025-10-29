// Import a shared EVENTS object used for listening to variant change events
import { EVENTS } from "./events.js";

// Define a custom HTML element <product-section>
class ProductSection extends HTMLElement {
  constructor() {
    super();

    // Define a reusable class name for hiding elements
    this.classes = {
      hidden: "hide"
    };

    // Define motor types, each with an ID and a list of identifying SKU fragments
    this.motors = [
      { id: "Motor 1", values: ["-M1-", "-M1A", "Motor 1B"] },
      { id: "Motor 2", values: ["-M2", "-M2A", "Motor 2B"] },
      { id: "Motor 4", values: ["-M4", "-M4F", "Motor 4HD"] },
      { id: "Motor 1DAB", values: ["-M1DAB"] },
      { id: "Motor 6", values: ["-M6"] },
    ];

    // Collect all child elements inside this section that have a data-motor-id attribute        
    this.motorId = this.querySelectorAll("[data-motor-id]");
  }

  // Called automatically when the element is inserted into the DOM
  connectedCallback() {
    this.abortController = new AbortController();

    // Listen for a variantChange event specific to this product section and product ID
    document.addEventListener(
      `${EVENTS.variantChange}:${this.dataset.sectionId}:${this.dataset.productId}`,
      this.getVariantInfo.bind(this), // Bind 'this' to the current instance
      { signal: this.abortController.signal } // Allow listener to be aborted when element is removed
    );
  }

  // Called automatically when the element is removed from the DOM
  disconnectedCallback() {
    // Clean up the event listener to avoid memory leaks
    this.abortController.abort();
  }

  // Handler for the variantChange event
  getVariantInfo({ detail }) {
    const { html, variant } = detail;

    // If no variant is present, do nothing
    if (!variant) {
      return;
    }

    // Extract the SKU of the selected variant and pass it for motor matching
    const variantSku = variant.sku;
    this.getVariantMotor(variantSku);
  }

  // Check which motor ID matches the SKU and update the UI accordingly
  getVariantMotor(sku) {
    this.motors.forEach((motor) => {
      motor.values.forEach((value) => {
        if (sku.includes(value)) {
          // If a value in the motor's list matches the SKU, show only that motor's content
          this.displayActiveMotor(motor.id);
        }
      });
    });
  }

  // Show the matched motor's content and hide others
  displayActiveMotor(id) {
    let motorItems = this.motorId;

    motorItems.forEach((item) => {
      let name = item.getAttribute("data-motor-id");

      if (name == id) {
        // Show the item if its data-motor-id matches the selected motor ID
        item.classList.remove(this.classes.hidden)
      } else {
        // Hide all other motor items
        item.classList.add(this.classes.hidden);
      }
    });
  }
}

// Register the custom element so it can be used in HTML as <product-section>
customElements.define("product-section", ProductSection);
