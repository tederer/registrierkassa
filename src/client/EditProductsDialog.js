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
               { defaultContent: '<button id="editButton">Bearbeiten</button>' },
               { defaultContent: '<button id="deleteButton">Löschen</button>' }
            ],
            paging: false,
            searching: false,
            bInfo: false,
            bSort: false
         } );
      };
      
      var onShowNewProductDialog = function onShowNewProductDialog() {
         bus.sendCommand(cash.client.topics.SHOW_CREATE_PRODUCT_DIALOG_COMMAND,{});
      };
      
      var onProductsReceived = function onProductsReceived(products) {
         
         var deleteButtonSelector = this.getContentContainerId() + ' #table #deleteButton';
         var editButtonSelector = this.getContentContainerId() + ' #table #editButton';
         
         $(deleteButtonSelector).off('click');
         $(editButtonSelector).off('click');

         table.clear();
         products.forEach(function(product) {
            table.row.add(product);
         });
         table.draw();
         
         $(deleteButtonSelector).on('click', function() {
            var row = table.row( $(this).parents('tr'));
            bus.sendCommand(cash.topics.DELETE_PRODUCT_COMMAND, {id: row.data().id});
         });
         $(editButtonSelector).on('click', function() {
            var row = table.row( $(this).parents('tr'));
            bus.sendCommand(cash.client.topics.SHOW_UPDATE_PRODUCT_DIALOG_COMMAND, {id: row.data().id, name: row.data().name, price: row.data().price});
            console.log('edit button clicked for ' + JSON.stringify({id: row.data().id, name: row.data().name, price: row.data().price}));
         });
      };
      
      var onShowEditProductDialogReceived = function onShowEditProductDialogReceived() {
         this.setVisible(true);
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Produkte bearbeiten ...';
      };
      
      this.getContainerId = function getContainerId() {
         return containerId;
      };
      
      this.initializeBodyContent = function initializeBodyContent(selector) {
         var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Name</th><th>Preis</th><th></th><th></th></tr></thead></table>';
         $(selector).html(tableHtml);
         initializeTable(selector + ' #table');
      };
      
      this.initializeSidebarContent = function initializeSidebarContent(selector) {
         var newProductButton = '<button type="button" id="newProductButton">Produkt hinzufügen</button>';
         $(selector).html(newProductButton);
         $(selector + ' > #newProductButton').on('click', onShowNewProductDialog);
      };
      
      this.completeInitialization = function completeInitialization() {
         bus.subscribeToPublication(cash.topics.PRODUCTS, onProductsReceived.bind(this));
         bus.subscribeToPublication(cash.client.topics.SHOW_EDIT_PRODUCTS_DIALOG_COMMAND, onShowEditProductDialogReceived.bind(this));
      };
};

cash.ui.EditProductsDialog.prototype = new cash.ui.ModalDialog();