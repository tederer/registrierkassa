/* global cash, assertNamespace */

assertNamespace('cash.ui');

/**
 * constructor for a InvoiceFooter.
 */
cash.ui.InvoiceFooter = function InvoiceFooter(containerId, bus) {
      var totalPriceId = containerId + ' #totalPrice';
      var totalPrice = 0;
      
      var updateTotalPrice = function updateTotalPrice() {
         $(totalPriceId).html(totalPrice.toFixed(2) + ' €');
      };
      
      var onItemsInInvoiceChanged = function onItemsInInvoiceChanged(commandData) {
         totalPrice = 0;
         commandData.forEach(function(item) {
            totalPrice += item.price;
         });
         
         updateTotalPrice();
      };
      
      var initializeContainerContent = function initializeContainerContent() {
         var containerContent =  '<table id="invoiceFooterTable">' +
                                    '<tr>' +
                                       '<td><button type="button" id="createInvoiceButton">Rechnung erstellen</button></td>' +
                                       '<td><table id="invoiceTotal"><tr><td>Summe:</td><td id="totalPrice"></td></tr></table></td>' +
                                       '<td><button type="button" id="clearInvoiceButton">Rechnungsinhalt löschen</button></td>' +
                                    '</tr>' +
                                 '</table>';

         $(containerId).html(containerContent);
         updateTotalPrice();
      };
      
      this.initialize = function initialize() {
         initializeContainerContent();
         bus.subscribeToPublication(cash.client.topics.INVOICE_ITEMS, onItemsInInvoiceChanged);
         $(containerId + ' #createInvoiceButton').on('click', function() {
            bus.sendCommand(cash.client.topics.CREATE_INVOICE_COMMAND, {});
         });
         $(containerId + ' #clearInvoiceButton').on('click', function() {
            bus.sendCommand(cash.client.topics.REMOVE_ALL_INVOICE_ITEMS_COMMAND, {});
         });
      };
};

cash.ui.InvoiceFooter.prototype = new cash.ui.UiComponent();