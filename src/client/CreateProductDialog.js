/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a CreateProductDialog that is invisible after its creation.
 */
cash.ui.CreateProductDialog = function CreateProductDialog(containerId, bus) {
      var nameInput;
      var priceInput;
      
      var onShowCreateNewProductCommand = function onShowCreateNewProductCommand() {
         this.setVisible(true);
      };
      
      this.onVisible = function onVisible() {
         nameInput.val('');
         priceInput.val(0);
      };
      
      this.onOkClicked = function onOkClicked() {
         bus.sendCommand(cash.topics.CREATE_PRODUCT_COMMAND, {name: nameInput.val(), price: parseFloat(priceInput.val())});
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Neues Produkt anlegen ...';
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
         bus.subscribeToCommand(cash.client.topics.SHOW_CREATE_NEW_PRODUCT_COMMAND, onShowCreateNewProductCommand.bind(this));
      };
};

cash.ui.CreateProductDialog.prototype = new cash.ui.ModalDialog();