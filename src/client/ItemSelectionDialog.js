/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a ItemSelectionDialog that is invisible after its creation.
 */
cash.ui.ItemSelectionDialog = function ItemSelectionDialog(containerId, bus) {
      var table;
            
      var initializeTable = function initializeTable(thisInstance) {
         table = $(thisInstance.getContentContainerId() + ' #table').DataTable({
            data: [],
            columns: [
               { data: 'name' },
               { data: 'price',
                 render: function( data, type, full, meta ) {
                  return data.toFixed(2) + ' €';
                 },
                 className: 'dt-body-right'
               }
            ],
            paging: false,
            searching: false,
            bInfo: false,
            bSort: false,
            select: {
               style: 'multi'
            }
         } );
      };
      
      this.onVisible = function onVisible() {
         table.rows({selected:true}).deselect();
      };
      
      this.onOkClicked = function onOkClicked() {
         var tableData = table.rows({selected:true}).data();
         
         if (tableData.length > 0) {
            var commandData = [];
            
            for (var index=0; index < tableData.length; index++) {
               commandData[commandData.length] = {'name': tableData[index].name, 'price': tableData[index].price};
            }
            
            bus.sendCommand(cash.client.topics.ADD_ITEMS_TO_INVOICE_COMMAND, commandData);
         }
         
         this.setVisible(false);
      };
      
      var onProductsReceived = function onProductsReceived(products) {
         table.clear();
         products.forEach(function(product) {
            table.row.add(product);
         });
         table.draw();
      };
      
      var onShowItemSelectionDialogCommandReceived = function onShowItemSelectionDialogCommandReceived() {
         this.setVisible(true);
      };
      
      this.getContainerId = function getContainerId() {
         return containerId;
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Produkte für Rechnung auswählen ...';
      };
      
      this.completeInitialization = function completeInitialization() {
         initializeTable(this);
         bus.subscribeToPublication(cash.topics.PRODUCTRANGE, onProductsReceived.bind(this));
         bus.subscribeToCommand(cash.client.topics.SHOW_ITEM_SELECTION_DIALOG_COMMAND, onShowItemSelectionDialogCommandReceived.bind(this));
      };
      
      this.initializeBodyContent = function initializeBodyContent(selector) {
         var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Name</th><th>Preis</th></tr></thead></table>';
         $(selector).html(tableHtml);
      };
};

cash.ui.ItemSelectionDialog.prototype = new cash.ui.ModalDialog();
