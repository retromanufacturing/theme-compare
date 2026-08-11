class VehicleSearchWidget extends HTMLElement {
  constructor() {
    super();

    this._onWidgetButtonClick = this.onWidgetButtonClick.bind(this);
    this._onWidgetIconClick = this.onWidgetIconClick.bind(this);
    this._onWidgetCloseClick = this.onWidgetCloseClick.bind(this);
    this._onSearchFitment = this.onSearchFitment.bind(this);
    this._onStorage = this.onStorage.bind(this);
  }

  connectedCallback() {
    this.widgetBar = this.querySelector(".js-ymm--widget-bar");
    this.widgetBtn = this.querySelector(".js-ymm--widget-btn");
    this.widgetIcon = this.querySelector(".js-ymm--widget-icon");
    this.widgetClose = this.querySelector(".js-ymm--widget-close");
    this.titleEls = this.querySelectorAll(".js-ymm--title");
    this.collapsible = this.querySelector(".js-ymm--collapsible");
    this.selector = this.querySelector("vehicle-search-selector");

    this.templateName = this.dataset.templateName || "";
    this.barDisplay = this.dataset.barDisplay || "";
    this.widgetStyle = this.widgetBar?.dataset.widgetStyle || "";

    if (this.widgetBtn) {
      this.widgetBtn.addEventListener("click", this._onWidgetButtonClick);
    }

    if (this.widgetIcon) {
      this.widgetIcon.addEventListener("click", this._onWidgetIconClick);
    }

    if (this.widgetClose) {
      this.widgetClose.addEventListener("click", this._onWidgetCloseClick);
    }

    this.addEventListener("custom:searchFitment", this._onSearchFitment);
    window.addEventListener("storage", this._onStorage);

    this.initializeFromStoredFitment();
  }

  disconnectedCallback() {
    if (this.widgetBtn) {
      this.widgetBtn.removeEventListener("click", this._onWidgetButtonClick);
    }

    if (this.widgetIcon) {
      this.widgetIcon.removeEventListener("click", this._onWidgetIconClick);
    }

    if (this.widgetClose) {
      this.widgetClose.removeEventListener("click", this._onWidgetCloseClick);
    }

    this.removeEventListener("custom:searchFitment", this._onSearchFitment);
    window.removeEventListener("storage", this._onStorage);
  }

  get currentFitment() {
    try {
      return JSON.parse(localStorage.getItem("vehicleFitment"));
    } catch (error) {
      return null;
    }
  }

  initializeFromStoredFitment() {
    const fitment = this.currentFitment;

    if (fitment?.year && fitment?.make && fitment?.model) {
      this.applyFitmentState({
        year: fitment.year,
        make: fitment.make,
        model: fitment.model
      });
      this.setWidgetDisplay("set");
      return;
    }

    this.applyDefaultTitle();
    this.setWidgetDisplay("not-set");
  }

  onStorage(event) {
    if (event.key !== "vehicleFitment") return;
    this.initializeFromStoredFitment();
  }

  onSearchFitment(event) {
    const { year, make, model } = event.detail || {};
    if (!year || !make || !model) return;

    this.applyFitmentState({ year, make, model });
    this.setWidgetDisplay("set");
    this.setButtonMode("reset");
  }

  onWidgetButtonClick() {
    const status = this.widgetBtn?.dataset.btnStatus || "closed";

    switch (status) {
      case "opened":
        this.closePanel();
        break;
      case "closed":
        this.openPanel();
        break;
      case "reset":
        this.resetWidget();
        break;
      default:
        this.openPanel();
        break;
    }
  }

  onWidgetIconClick() {
    if (!this.widgetBar || !this.widgetIcon) return;

    const iconStatus = this.widgetIcon.dataset.iconStatus || "closed";

    if (iconStatus === "opened") {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  onWidgetCloseClick() {
    this.closePanel();
  }

  applyFitmentState({ year, make, model }) {
    const title = `${year} ${make} ${model}`;
    this.setFitmentTitle(title);
  }

  applyDefaultTitle() {
    const defaultTitle = this.titleEls[0]?.textContent?.trim() || "";
    this.setFitmentTitle(defaultTitle);
  }

  setFitmentTitle(text) {
    this.titleEls.forEach((titleEl) => {
      if (!titleEl) return;
      titleEl.textContent = text;
    });
  }

  openPanel() {
    if (this.collapsible) {
      this.collapsible.classList.add("is-open");
    }

    if (this.widgetBtn) {
      this.widgetBtn.classList.add("is-open");
    }

    if (this.widgetBar) {
      this.widgetBar.classList.add("is-open");
    }

    if (this.widgetIcon) {
      this.widgetIcon.dataset.iconStatus = "opened";
    }

    this.setButtonMode("opened");
    this.showBar();
    this.hideIcon();
  }

  closePanel() {
    if (this.collapsible) {
      this.collapsible.classList.remove("is-open");
    }

    if (this.widgetBtn) {
      this.widgetBtn.classList.remove("is-open");
    }

    if (this.widgetBar) {
      this.widgetBar.classList.remove("is-open");
    }

    if (this.widgetIcon) {
      this.widgetIcon.dataset.iconStatus = "closed";
    }

    const hasFitment = !!(this.currentFitment?.year && this.currentFitment?.make && this.currentFitment?.model);

        const isMobile = window.innerWidth < 769;

    if (this.widgetStyle === "icon" && isMobile) {
      this.widgetBar.classList.add("hide");
      this.showIcon();
      this.setButtonMode(hasFitment ? "reset" : "closed");
      return;
    }

    this.setButtonMode(hasFitment ? "reset" : "closed");
    this.setWidgetDisplay(hasFitment ? "set" : "not-set");
  }

  resetWidget() {
    localStorage.removeItem("vehicleFitment");

    if (this.selector) {
      const resetButton = this.selector.querySelector(".js-ymm--reset");
      if (resetButton) {
        resetButton.click();
      } else if (typeof this.selector.onReset === "function") {
        this.selector.onReset();
      }
    }

    this.applyDefaultTitle();
    this.setButtonMode("closed");
    this.setWidgetDisplay("not-set");
    this.openPanel();
  }

  setButtonMode(mode) {
    if (!this.widgetBtn) return;

    const openedLabel = this.widgetBtn.dataset.btnOpened || "";
    const closedLabel = this.widgetBtn.dataset.btnClosed || "";
    const resetLabel = this.widgetBtn.dataset.btnReset || "";

    switch (mode) {
      case "opened":
        this.widgetBtn.dataset.btnStatus = "opened";
        this.widgetBtn.innerHTML = openedLabel;
        break;
      case "reset":
        this.widgetBtn.dataset.btnStatus = "reset";
        this.widgetBtn.innerHTML = resetLabel;
        break;
      case "closed":
      default:
        this.widgetBtn.dataset.btnStatus = "closed";
        this.widgetBtn.innerHTML = closedLabel;
        break;
    }
  }

    setWidgetDisplay(status) {
    if (!this.widgetBar) return;

    const isMobile = window.innerWidth < 769;

    if (this.widgetStyle === "icon") {
      if (isMobile) {
        this.widgetBar.classList.add("hide");
        this.showIcon();
      } else {
        this.widgetBar.classList.remove("hide");
        this.hideIcon();
      }

      this.setButtonMode(status === "set" ? "reset" : "closed");
      return;
    }

    this.widgetBar.classList.remove("hide");
    this.hideIcon();

    if (status === "set") {
      this.setButtonMode("reset");
    } else {
      this.setButtonMode("closed");
    }
  }

  showBar() {
    if (!this.widgetBar) return;
    this.widgetBar.classList.remove("hide");
  }

  hideBarIfNeeded() {
    if (!this.widgetBar) return;

    const disableBarAwayFromHomepage =
      this.barDisplay === "true" || this.barDisplay === "1";

    const onHomepage =
      this.templateName === "index" ||
      window.location.pathname === "/" ||
      window.location.pathname === "";

    if (disableBarAwayFromHomepage && !onHomepage) {
      this.widgetBar.classList.add("hide");
      return;
    }

    this.widgetBar.classList.remove("hide");
  }

  showIcon() {
    if (!this.widgetIcon) return;
    this.widgetIcon.classList.remove("hide");
  }

  hideIcon() {
    if (!this.widgetIcon) return;
    this.widgetIcon.classList.add("hide");
  }
}

customElements.define("vehicle-search-widget", VehicleSearchWidget);