/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a EditInvoiceItemDialog that is invisible after its creation.
 */
cash.ui.EditInvoiceItemDialog = function EditInvoiceItemDialog(containerId, bus) {
      var contentContainerId = containerId + ' > #content';
      var rowIndex;
      var nameInput;
      var priceInput;
      
      var setVisible = function setVisible(visible) {
         $(containerId).css('visibility', visible ? 'visible' : 'hidden');
      };
      
      var onOkClicked = function onOkClicked() {
         bus.sendCommand(cash.client.topics.UPDATE_INVOICE_ITEM_COMMAND, {rowIndex: rowIndex, name: nameInput.val(), price: parseFloat(priceInput.val())});
         setVisible(false);
      };
      
      var onCancelClicked = function onCancelClicked() {
         setVisible(false);
      };
      
      var onEditInvoiceItem = function onEditInvoiceItem(commandData) {
         nameInput.val(commandData.name);
         priceInput.val(commandData.price);
         rowIndex = commandData.rowIndex;
         setVisible(true);
      };
      
      var initializeContainerContent = function initializeContainerContent() {
         var containerContent = '<div id="content"><div id="body"></div><div id="footer"></div></div>';
         var bodyContent      = '<table><tr><td>Name:</td><td><input id="name" type="text"/></td></tr><tr><td>Preis:</td><td><input id="price" type="number" step="0.5"/></td></tr></table>';
         var okButton         = '<button type="button" id="okButton">OK</button>';
         var cancelButton     = '<button type="button" id="cancelButton">Abbrechen</button>';

         $(containerId).html(containerContent);
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
         bus.subscribeToCommand(cash.client.topics.EDIT_INVOICE_ITEM_COMMAND, onEditInvoiceItem);
      };
};

cash.ui.EditInvoiceItemDialog.prototype = new cash.ui.UiComponent();