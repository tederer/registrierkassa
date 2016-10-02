/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a EditInvoiceItemDialog that can be used to modify an entry
 * of the invoice.
 */
cash.ui.EditInvoiceItemDialog = function EditInvoiceItemDialog(containerId, bus) {
      var rowIndex;
      var nameInput;
      var priceInput;
      
      var onEditInvoiceItem = function onEditInvoiceItem(commandData) {
         nameInput.val(commandData.name);
         priceInput.val(commandData.price);
         rowIndex = commandData.rowIndex;
         this.setVisible(true);
      };
      
      this.onOkClicked = function onOkClicked() {
         bus.sendCommand(cash.client.topics.UPDATE_INVOICE_ITEM_COMMAND, {rowIndex: rowIndex, name: nameInput.val(), price: parseFloat(priceInput.val())});
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Rechnungsposition bearbeiten ...';
      };
      
      this.getContainerId = function getContainerId() {
         return containerId;
      };
      
      this.initializeBodyContent = function initializeBodyContent(selector) {
         var bodyContent = '<table><tr><td>Name:</td><td><input id="name" type="text"/></td></tr><tr><td>Preis:</td><td><input id="price" type="number" step="0.5"/></td></tr></table>';
         $(selector).html(bodyContent);
         nameInput = $(selector + ' #name');
         priceInput = $(selector + ' #price');
      };
      
      this.completeInitialization = function completeInitialization() {
         bus.subscribeToCommand(cash.client.topics.EDIT_INVOICE_ITEM_COMMAND, onEditInvoiceItem.bind(this));
      };
};

cash.ui.EditInvoiceItemDialog.prototype = new cash.ui.ModalDialog();