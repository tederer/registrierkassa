/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a modal dialog that is invisible after its creation.
 */
cash.ui.ModalDialog = function ModalDialog() {
      
      var processOkButtonClicked = function processOkButtonClicked() {
         this.setVisible(false);
         this.onOkClicked();
      };
      
      var processCancelButtonClicked = function processCancelButtonClicked() {
         this.setVisible(false);
         this.onCancelClicked();
      };
      
      var initializeContainerContent = function initializeContainerContent(thisInstance) {
         var contentContainerId  = thisInstance.getContentContainerId();
         var containerContent    = '<div id="content"><div id="header"></div><div id="body"></div><div id="sidebar"></div><div id="footer"></div></div>';
         var okButton            = '<button type="button" id="okButton">OK</button>';
         var cancelButton        = '<button type="button" id="cancelButton">Abbrechen</button>';

         $(thisInstance.getContainerId()).html(containerContent);
         $(contentContainerId + ' > #header').html(thisInstance.getDialogTitle());
         $(contentContainerId + ' > #footer').html(okButton + cancelButton);
         
         thisInstance.initializeBodyContent(contentContainerId + ' > #body');
         thisInstance.initializeSidebarContent(contentContainerId + ' > #sidebar');
         
         $(contentContainerId + ' > #footer > #okButton').on('click', processOkButtonClicked.bind(thisInstance));
         $(contentContainerId + ' > #footer > #cancelButton').on('click', processCancelButtonClicked.bind(thisInstance));
      };
      
      this.getContainerId = function getContainerId() {
         return '';
      };
      
      this.getContentContainerId = function getContentContainerId() {
         return this.getContainerId() + ' > #content';
      };
      
      this.setVisible = function setVisible(visible) {
         $(this.getContainerId()).css('visibility', visible ? 'visible' : 'hidden');
         
         if (visible) {
            this.onVisible();
         }
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return '';
      };
      
      this.completeInitialization = function completeInitialization() {};
      this.initializeBodyContent = function initializeBodyContent(selector) {};
      this.initializeSidebarContent = function initializeSidebarContent(selector) {};
      this.onCancelClicked = function onCancelClicked() {};
      this.onOkClicked = function onOkClicked() {};
      this.onVisible = function onVisible() {};
      
      this.initialize = function initialize() { 
         this.setVisible(false);
         initializeContainerContent(this);
         this.completeInitialization();
      };
};

cash.ui.ModalDialog.prototype = new cash.ui.UiComponent();