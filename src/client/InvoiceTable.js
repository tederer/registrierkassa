/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a InvoiceTable.
 */
cash.ui.InvoiceTable = function InvoiceTable(containerId, bus) {
      var container;
      var table;
            
      var initializeTable = function initializeTable() {
         table = $(containerId + ' > #table').DataTable({
            data: [],
            columns: [
               { data: 'name' },
               { 
                  data: 'price',
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
      
      var publishCurrentTableContent = function publishCurrentTableContent() {
         var items = [];
         var tableData = table.rows().data();
         
         for (var index=0; index < tableData.length; index++) {
            items[items.length] = {'name': tableData[index].name, 'price': tableData[index].price};
         }
         bus.publish(cash.client.topics.INVOICE_ITEMS, items);
      };
      
      var removeCurrentRow = function removeCurrentRow() {
         table.row( $(this).parents('tr') ).remove().draw();
         publishCurrentTableContent();
      };
      
      var editCurrentRow = function editCurrentRow() {
         var row = table.row( $(this).parents('tr'));
         var rowContent = row.data();
         bus.sendCommand(cash.client.topics.EDIT_INVOICE_ITEM_COMMAND, {rowIndex: row.index(), name: rowContent.name, price: rowContent.price});
      };
      
      var runExecutableAndUpdateButtonActions = function runExecutableAndUpdateButtonActions(executable) {
         $(containerId + ' #table #deleteButton').off('click');
         $(containerId + ' #table #editButton').off('click');
         executable();
         $(containerId + ' #table #deleteButton').on('click', function() { 
            runExecutableAndUpdateButtonActions(removeCurrentRow.bind(this));
         });
         $(containerId + ' #table #editButton').on('click', function() { 
            runExecutableAndUpdateButtonActions(editCurrentRow.bind(this));
         });
      };
      
      var onAddItemsToInvoice = function onAddItemsToInvoice(items) {
         runExecutableAndUpdateButtonActions(function() {
            items.forEach(function(item) {
               table.row.add(item);
            });
            table.draw();
         });
         publishCurrentTableContent();
      };
      
      var onUpdateItem = function onUpdateItem(commandData) {
         runExecutableAndUpdateButtonActions(function() {
            var data = table.row(commandData.rowIndex).data();
            data.name = commandData.name;
            data.price = commandData.price;
            table.row(commandData.rowIndex).data(data);
         });
         publishCurrentTableContent();
      };
      
      var initializeContainerContent = function initializeContainerContent() {
         var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Name</th><th>Preis</th><th></th><th></th></tr></thead></table>';
         container.html(tableHtml);
      };
      
      this.initialize = function initialize() {
         container = $(containerId);
         initializeContainerContent();
         initializeTable();
         bus.subscribeToCommand(cash.client.topics.ADD_ITEMS_TO_INVOICE_COMMAND, onAddItemsToInvoice);
         bus.subscribeToCommand(cash.client.topics.UPDATE_INVOICE_ITEM_COMMAND, onUpdateItem);
      };
};

cash.ui.ItemSelectionDialog.prototype = new cash.ui.UiComponent();