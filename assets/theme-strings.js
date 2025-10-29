theme.strings = {
  shippingCalcSubmitButton: {{ settings.shipping_calculator_submit_button_label | default: 'Calculate shipping' | json }},
  shippingCalcSubmitButtonDisabled: {{ settings.shipping_calculator_submit_button_label_disabled | default: 'Calculating...' | json }},
  {% if customer %}shippingCalcCustomerIsLoggedIn: true,{% endif %}
  shippingCalcMoneyFormat: {{ shop.money_with_currency_format | json }}
};
