/* global cash, assertNamespace */

assertNamespace('cash');

/**
 * constructor for a InvoiceCreator.
 */
cash.InvoiceCreator = function InvoiceCreator(bus) {
   var id = 1;
   var invoiceItems;
   
   var onCreateInvoiceCommandReceived = function onCreateInvoiceCommandReceived() {
      bus.sendCommand(cash.topics.CREATE_INVOICE_COMMAND, {id: id++, items: invoiceItems});
   };
   
   var onAcknowledgeInvoiceCommandReceived = function onAcknowledgeInvoiceCommandReceived() {
      bus.sendCommand(cash.client.topics.REMOVE_ALL_INVOICE_ITEMS_COMMAND, {});
   };
   
   var onInvoiceItemsReceived = function onInvoiceItemsReceived(items) {
      invoiceItems = items;
   };
   
   this.initialize = function initialize() {
      bus.subscribeToPublication(cash.client.topics.INVOICE_ITEMS, onInvoiceItemsReceived);
      bus.subscribeToCommand(cash.client.topics.CREATE_INVOICE_COMMAND, onCreateInvoiceCommandReceived);
      bus.subscribeToCommand(cash.topics.ACKNOWLEDGE_INVOICE_COMMAND, onAcknowledgeInvoiceCommandReceived);
   };
};
