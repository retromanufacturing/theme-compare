/**
 * Module to add a shipping rates calculator to cart page.
 *
 * Copyright (c) 2011-2016 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Modified by David Little, 2016
 * Refactored to ES6 class structure extending HTMLElement
 */

// Legacy Countries extension
"object"==typeof Countries&&(Countries.updateProvinceLabel=function(e,t){if("string"==typeof e&&Countries[e]&&Countries[e].provinces){if("object"!=typeof t&&(t=document.getElementById("address_province_label"),null===t))return;t.innerHTML=Countries[e].label;var r=jQuery(t).parent();r.find("select");r.find(".custom-style-select-box-inner").html(Countries[e].provinces[0])}});

// Legacy Shopify Cart ShippingCalculator
"undefined"==typeof Shopify.Cart&&(Shopify.Cart={}),Shopify.Cart.ShippingCalculator=function(){var _config={submitButton:"Calculate shipping",submitButtonDisabled:"Calculating...",templateId:"shipping-calculator-response-template",wrapperId:"wrapper-response",customerIsLoggedIn:!1,moneyFormat:"${{amount}}"},_render=function(e){var t=jQuery("#"+_config.templateId),r=jQuery("#"+_config.wrapperId);if(t.length&&r.length){var templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var n=Handlebars.compile(jQuery.trim(t.text())),a=n(e);if(jQuery(a).appendTo(r),"undefined"!=typeof Currency&&"function"==typeof Currency.convertAll){var i="";jQuery("[name=currencies]").size()?i=jQuery("[name=currencies]").val():jQuery("#currencies span.selected").size()&&(i=jQuery("#currencies span.selected").attr("data-currency")),""!==i&&Currency.convertAll(shopCurrency,i,"#wrapper-response span.money, #estimated-shipping span.money")}}},_enableButtons=function(){jQuery(".get-rates").removeAttr("disabled").removeClass("disabled").val(_config.submitButton)},_disableButtons=function(){jQuery(".get-rates").val(_config.submitButtonDisabled).attr("disabled","disabled").addClass("disabled")},_getCartShippingRatesForDestination=function(e){var t={type:"POST",url:"/cart/prepare_shipping_rates",data:jQuery.param({shipping_address:e}),success:_pollForCartShippingRatesForDestination(e),error:_onError};jQuery.ajax(t)},_pollForCartShippingRatesForDestination=function(e){var t=function(){jQuery.ajax("/cart/async_shipping_rates",{dataType:"json",success:function(r,n,a){200===a.status?_onCartShippingRatesUpdate(r.shipping_rates,e):setTimeout(t,500)},error:_onError})};return t},_fullMessagesFromErrors=function(e){var t=[];return jQuery.each(e,function(e,r){jQuery.each(r,function(r,n){t.push(e+" "+n)})}),t},_onError=function(XMLHttpRequest,textStatus){jQuery("#estimated-shipping").hide(),jQuery("#estimated-shipping em").empty(),_enableButtons();var feedback="",data=eval("("+XMLHttpRequest.responseText+")");feedback=data.message?data.message+"("+data.status+"): "+data.description:"Error : "+_fullMessagesFromErrors(data).join("; ")+".","Error : country is not supported."===feedback&&(feedback="We do not ship to this destination."),_render({rates:[],errorFeedback:feedback,success:!1}),jQuery("#"+_config.wrapperId).show()},_onCartShippingRatesUpdate=function(e,t){_enableButtons();var r="";if(t.zip&&(r+=t.zip+", "),t.province&&(r+=t.province+", "),r+=t.country,e.length){"0.00"==e[0].price?jQuery("#estimated-shipping em").html("FREE"):jQuery("#estimated-shipping em").html(_formatRate(e[0].price));for(var n=0;n<e.length;n++)e[n].price=_formatRate(e[n].price)}_render({rates:e,address:r,success:!0}),jQuery("#"+_config.wrapperId+", #estimated-shipping").fadeIn()},_formatRate=function(e){function t(e,t){return"undefined"==typeof e?t:e}function r(e,r,n,a){if(r=t(r,2),n=t(n,","),a=t(a,"."),isNaN(e)||null==e)return 0;e=(e/100).toFixed(r);var i=e.split("."),o=i[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+n),s=i[1]?a+i[1]:"";return o+s}if("function"==typeof Shopify.formatMoney)return Shopify.formatMoney(e,_config.moneyFormat);"string"==typeof e&&(e=e.replace(".",""));var n="",a=/\{\{\s*(\w+)\s*\}\}/,i=_config.moneyFormat;switch(i.match(a)[1]){case"amount":n=r(e,2);break;case"amount_no_decimals":n=r(e,0);break;case"amount_with_comma_separator":n=r(e,2,".",",");break;case"amount_no_decimals_with_comma_separator":n=r(e,0,".",",")}return i.replace(a,n)};return _init=function(){new Shopify.CountryProvinceSelector("address_country","address_province",{hideElement:"address_province_container"});var e=jQuery("#address_country"),t=jQuery("#address_province_label").get(0);"undefined"!=typeof Countries&&(Countries.updateProvinceLabel(e.val(),t),e.change(function(){Countries.updateProvinceLabel(e.val(),t)})),jQuery(".get-rates").click(function(){_disableButtons(),jQuery("#"+_config.wrapperId).empty().hide();var e={};e.zip=jQuery("#address_zip").val()||"",e.country=jQuery("#address_country").val()||"",e.province=jQuery("#address_province").val()||"",_getCartShippingRatesForDestination(e)}),_config.customerIsLoggedIn&&jQuery(".get-rates:eq(0)").trigger("click")},{show:function(e){e=e||{},jQuery.extend(_config,e),jQuery(function(){_init()})},getConfig:function(){return _config},formatRate:function(e){return _formatRate(e)}}}();

/*============================================================================
  ShippingCalculator
  - Custom element for managing shipping calculator UI interactions
  - Handles cart estimate updates
==============================================================================*/
class ShippingCalculator extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController()
    
    this.selectors = {
      calculateBtn: '#cart__calculate-shipping',
      recalculateBtn: '#cart__recalculate-shipping',
      shipCalculator: '.shipping-calculator',
      subtotal: '#cart__subtotal',
      estimatedShipping: '#cart__estimated-shipping',
      estimatedTotal: '#cart__estimated-total',
      shippingRate: '#estimated-shipping-rate',
      shippingApply: '#estimated-shipping-apply'
    }

    this.classes = {
      hide: 'hide'
    }

    this.config = {
      buttonText: {
        calculate: 'Calculate shipping',
        hide: 'Hide shipping calculator',
        recalculate: '(Recalculate)'
      }
    }

    this.initializeElements()
    this.initializeLegacyCalculator()
    this.bindEvents()
  }

  disconnectedCallback() {
    this.abortController.abort()
  }

  initializeElements() {
    this.elements = {
      calculateBtn: document.querySelector(this.selectors.calculateBtn),
      recalculateBtn: document.querySelector(this.selectors.recalculateBtn),
      shipCalculator: document.querySelector(this.selectors.shipCalculator)
    }

    this.amounts = {
      subtotal: document.querySelector(this.selectors.subtotal),
      shipping: document.querySelector(this.selectors.estimatedShipping),
      total: document.querySelector(this.selectors.estimatedTotal)
    }
  }

  initializeLegacyCalculator() {
    if (typeof Shopify !== 'undefined' && Shopify.Cart && Shopify.Cart.ShippingCalculator) {
      Shopify.Cart.ShippingCalculator.show({
        submitButton: theme.strings.shippingCalcSubmitButton,
        submitButtonDisabled: theme.strings.shippingCalcSubmitButtonDisabled,
        customerIsLoggedIn: theme.strings.shippingCalcCustomerIsLoggedIn,
        moneyFormat: theme.strings.shippingCalcMoneyFormat,
      })
    }
  }

  bindEvents() {
    if (this.elements.calculateBtn) {
      this.elements.calculateBtn.addEventListener('click', this.handleCalculateClick.bind(this), {
        signal: this.abortController.signal
      })
    }

    if (this.elements.recalculateBtn) {
      this.elements.recalculateBtn.addEventListener('click', this.handleRecalculateClick.bind(this), {
        signal: this.abortController.signal
      })
    }

    document.addEventListener('click', this.handleShippingApplyClick.bind(this), {
      signal: this.abortController.signal
    })
  }

  handleCalculateClick(event) {
    event.preventDefault()
    const currentText = this.elements.calculateBtn.innerHTML.trim()
    
    switch (currentText) {
      case this.config.buttonText.calculate:
        this.showCalculator()
        break
      case this.config.buttonText.hide:
        this.hideCalculator()
        break
      case this.config.buttonText.recalculate:
        this.showCalculatorForRecalculation()
        break
    }
  }

  handleRecalculateClick(event) {
    event.preventDefault()
    this.elements.calculateBtn.innerHTML = this.config.buttonText.hide
    this.amounts.shipping.innerHTML = ''
    this.elements.shipCalculator.classList.remove(this.classes.hide)
  }

  handleShippingApplyClick(event) {
    const target = event.target.closest(this.selectors.shippingApply)
    if (target) {
      event.preventDefault()
      this.updateCartEstimates()
    }
  }

  showCalculator() {
    this.elements.calculateBtn.innerHTML = this.config.buttonText.hide
    this.elements.shipCalculator.classList.remove(this.classes.hide)
  }

  hideCalculator() {
    this.elements.calculateBtn.innerHTML = this.config.buttonText.calculate
    this.elements.shipCalculator.classList.add(this.classes.hide)
  }

  showCalculatorForRecalculation() {
    this.elements.calculateBtn.innerHTML = this.config.buttonText.hide
    this.amounts.shipping.innerHTML = ''
    this.elements.shipCalculator.classList.remove(this.classes.hide)
  }

  formatMoney(amount, format) {
    // Use Shopify's formatMoney if available, otherwise use theme.Currency as fallback
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(amount, format || theme.settings.moneyFormat)
    } else if (typeof theme !== 'undefined' && theme.Currency && theme.Currency.formatMoney) {
      return theme.Currency.formatMoney(amount, format || theme.settings.moneyFormat)
    } else {
      // Fallback to simple formatting
      return '$' + (amount / 100).toFixed(2)
    }
  }

  updateEstimatedShipping() {
    const shippingRateElement = document.querySelector(this.selectors.shippingRate)
    if (!shippingRateElement) return

    const estimatedRate = shippingRateElement.innerHTML.replace(/\D/g, '')
    this.amounts.shipping.dataset.amount = estimatedRate
    this.amounts.shipping.innerHTML = this.formatMoney(estimatedRate)
  }

  updateEstimatedTotal() {
    const estimatedTotal = +this.amounts.subtotal.dataset.amount + +this.amounts.shipping.dataset.amount
    this.amounts.total.innerHTML = this.formatMoney(estimatedTotal)
  }

  updateCalculatorUI() {
    this.elements.calculateBtn.classList.add(this.classes.hide)
    this.elements.recalculateBtn.classList.remove(this.classes.hide)
    this.elements.shipCalculator.classList.add(this.classes.hide)
  }

  // Public API
  async updateCartEstimates() {
    try {
      this.updateEstimatedShipping()
      this.updateEstimatedTotal()
      this.updateCalculatorUI()
    } catch (err) {
      console.error('Error updating cart estimates:', err)
    }
  }

  show() {
    if (this.elements.shipCalculator) {
      this.elements.shipCalculator.classList.remove(this.classes.hide)
    }
  }

  hide() {
    if (this.elements.shipCalculator) {
      this.elements.shipCalculator.classList.add(this.classes.hide)
    }
  }
}

// Register the custom element
customElements.define('shipping-calculator', ShippingCalculator)