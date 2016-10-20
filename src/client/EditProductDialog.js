/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a EditProductDialog that can be used to modify an entry
 * of the invoice.
 */
cash.ui.EditProductDialog = function EditProductDialog(containerId, bus) {
      var id;
      var nameInput;
      var priceInput;
      
      var onEditProductCommand = function onEditProductCommand(commandData) {
         nameInput.val(commandData.name);
         priceInput.val(commandData.price);
         id = commandData.id;
         this.setVisible(true);
      };
      
      this.onOkClicked = function onOkClicked() {
         //bus.sendCommand(cash.client.topics.UPDATE_INVOICE_ITEM_COMMAND, {id: id, name: nameInput.val(), price: parseFloat(priceInput.val())});
         console.log('ok clicked with values ' + JSON.stringify({id: id, name: nameInput.val(), price: parseFloat(priceInput.val())}));
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Produkt bearbeiten ...';
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
         bus.subscribeToCommand(cash.client.topics.EDIT_PRODUCT_COMMAND, onEditProductCommand.bind(this));
      };
};

cash.ui.EditProductDialog.prototype = new cash.ui.ModalDialog();