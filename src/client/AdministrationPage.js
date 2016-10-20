/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a AdministrationPage.
 */
cash.ui.AdministrationPage = function AdministrationPage(containerId, bus) {
      
      var initializeContainerContent = function initializeContainerContent() {
         var sidebarHtml = '<button type="button" id="editProductRangeButton">Sortiment bearbeiten</button>';
         $(containerId).html(sidebarHtml);
      };
      
      this.initialize = function initialize() {
         initializeContainerContent();
         $(containerId + '> #editProductRangeButton').on('click', function() {
            bus.sendCommand(cash.client.topics.SHOW_EDIT_PRODUCT_RANGE_DIALOG_COMMAND, {});
         });
      };
};
      
cash.ui.AdministrationPage.prototype = new cash.ui.UiComponent();