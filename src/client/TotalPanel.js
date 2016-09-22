/* global cash, assertNamespace */

assertNamespace('cash.ui');

/**
 * constructor for a TotalPanel.
 */
cash.ui.TotalPanel = function TotalPanel(containerId, bus) {
      var totalPriceId = containerId + ' #totalPrice';
      var totalPrice = 0;
      
      var updateTotalPrice = function updateTotalPrice() {
         $(totalPriceId).html(totalPrice.toFixed(2));
      };
      
      var onItemsInInvoiceChanged = function onItemsInInvoiceChanged(commandData) {
         totalPrice = 0;
         commandData.forEach(function(item) {
            totalPrice += item.price;
         });
         
         updateTotalPrice();
      };
      
      var initializeContainerContent = function initializeContainerContent() {
         var containerContent = '<table><tr><td>Summe:</td><td id="totalPrice"></td></tr></table>';

         $(containerId).html(containerContent);
         updateTotalPrice();
      };
      
      this.initialize = function initialize() {
         initializeContainerContent();
         bus.subscribeToPublication(cash.client.topics.INVOICE_ITEMS, onItemsInInvoiceChanged);
      };
};

cash.ui.TotalPanel.prototype = new cash.ui.UiComponent();