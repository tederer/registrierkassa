/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a CreateNewProductDialog that is invisible after its creation.
 */
cash.ui.CreateNewProductDialog = function CreateNewProductDialog(containerId, bus) {
      
      var onShowCreateNewProductCommand = function onShowCreateNewProductCommand() {
         this.setVisible(true);
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
      };
      
      this.completeInitialization = function completeInitialization() {
         bus.subscribeToCommand(cash.client.topics.SHOW_CREATE_NEW_PRODUCT_COMMAND, onShowCreateNewProductCommand.bind(this));
      };
};

cash.ui.CreateNewProductDialog.prototype = new cash.ui.ModalDialog();