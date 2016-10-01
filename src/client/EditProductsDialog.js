/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a EditProductsDialog that is invisible after its creation.
 */
cash.ui.EditProductsDialog = function EditProductsDialog(containerId, bus) {
      var table;
            
      var initializeTable = function initializeTable(selector) {
         table = $(selector).DataTable({
            data: [],
            columns: [
               { data: 'name' },
               { data: 'price',
                 render: function( data, type, full, meta ) {
                  return data.toFixed(2) + ' €';
                 },
                 className: 'dt-body-right'
               },
               { defaultContent: '<button id="deleteButton">Löschen</button>' }
            ],
            paging: false,
            searching: false,
            bInfo: false,
            bSort: false
         } );
      };
      
      var onShowNewProductDialog = function onShowNewProductDialog() {
         bus.sendCommand(cash.client.topics.SHOW_CREATE_NEW_PRODUCT_COMMAND,{});
      };
      
      var onProductsReceived = function onProductsReceived(products) {
         table.clear();
         products.forEach(function(product) {
            table.row.add(product);
         });
         table.draw();
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Produkte bearbeiten ...';
      };
      
      this.getContainerId = function getContainerId() {
         return containerId;
      };
      
      this.initializeBodyContent = function initializeBodyContent(selector) {
         var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Name</th><th>Preis</th><th></th></tr></thead></table>';
         $(selector).html(tableHtml);
         initializeTable(selector + ' #table');
      };
      
      this.initializeSidebarContent = function initializeSidebarContent(selector) {
         var newProductButton = '<button type="button" id="newProductButton">Produkt hinzufügen</button>';
         $(selector).html(newProductButton);
         $(selector + ' > #newProductButton').on('click', onShowNewProductDialog);
      };
      
      this.completeInitialization = function completeInitialization() {
         bus.subscribeToPublication(cash.topics.PRODUCTS, onProductsReceived);
      };
};

cash.ui.EditProductsDialog.prototype = new cash.ui.ModalDialog();