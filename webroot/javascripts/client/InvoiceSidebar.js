/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a InvoiceSidebar.
 */
cash.ui.InvoiceSidebar = function InvoiceSidebar(containerId, bus) {
      
      var initializeContainerContent = function initializeContainerContent() {
         var sidebarHtml = '<button type="button" id="addItemButton">Produkt hinzufügen</button>';
         $(containerId).html(sidebarHtml);
      };
      
      this.initialize = function initialize() {
         initializeContainerContent();
         $(containerId + '> #addItemButton').on('click', function() {
            bus.publish(cash.client.topics.SHOW_ITEM_SELECTION_DIALOG_COMMAND, {});
         });
      };
};

cash.ui.InvoiceSidebar.prototype = new cash.ui.UiComponent();