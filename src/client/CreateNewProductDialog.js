/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a CreateNewProductDialog that is invisible after its creation.
 */
cash.ui.CreateNewProductDialog = function CreateNewProductDialog(containerId, bus) {
      var contentContainerId = containerId + ' > #content';
      var nameInput;
      var priceInput;
      
      var setVisible = function setVisible(visible) {
         $(containerId).css('visibility', visible ? 'visible' : 'hidden');
      };
      
      var onOkClicked = function onOkClicked() {
         // send command to cash.topics.CREATE_NEW_PRODUCT_COMMAND
         setVisible(false);
      };
      
      var onCancelClicked = function onCancelClicked() {
         setVisible(false);
      };
      
      var onShowCreateNewProductCommand = function onShowCreateNewProductCommand() {console.log('onShowCreateNewProductCommand');
         nameInput.val('');
         priceInput.val('');
         setVisible(true);
      };
      
      var initializeContainerContent = function initializeContainerContent() {
         var containerContent = '<div id="content"><div id="header"></div><div id="body"></div><div id="footer"></div></div>';
         var bodyContent      = '<table><tr><td>Name:</td><td><input id="name" type="text"/></td></tr><tr><td>Preis:</td><td><input id="price" type="number" step="0.5"/></td></tr></table>';
         var okButton         = '<button type="button" id="okButton">OK</button>';
         var cancelButton     = '<button type="button" id="cancelButton">Abbrechen</button>';

         $(containerId).html(containerContent);
         $(contentContainerId + ' > #header').html('Neues Produkt anlegen ...');
         $(contentContainerId + ' > #body').html(bodyContent);
         $(contentContainerId + ' > #footer').html(okButton + cancelButton);
         
         nameInput = $(contentContainerId + ' #name');
         priceInput = $(contentContainerId + ' #price');
         
         $(contentContainerId + ' > #footer > #okButton').on('click', onOkClicked);
         $(contentContainerId + ' > #footer > #cancelButton').on('click', onCancelClicked);
      };
      
      this.initialize = function initialize() {
         setVisible(false);
         initializeContainerContent();
         bus.subscribeToCommand(cash.client.topics.SHOW_CREATE_NEW_PRODUCT_COMMAND, onShowCreateNewProductCommand);
      };
};

cash.ui.CreateNewProductDialog.prototype = new cash.ui.UiComponent();