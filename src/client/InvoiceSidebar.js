/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a InvoiceSidebar.
 */
cash.ui.InvoiceSidebar = function InvoiceSidebar(containerId, bus) {

   var table;
      
   var initializeTable = function initializeTable(thisInstance) {
      table = $(thisInstance.getContainerId() + ' #table').DataTable({
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
      } );
   };
       
   var onProductsReceived = function onProductsReceived(products) {
      table.clear();
      products.forEach(function(product) {
         table.row.add(product);
      });
      table.draw();
   };
      
   var initializeContainerContent = function initializeContainerContent() {
      var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Name</th><th>Preis</th></tr></thead></table>';
      var clearInvoiceButtonHtml = '<button type="button" id="clearInvoiceButton">Rechnungsinhalt löschen</button>';
         
      $(containerId).html('<h2>Produktauswahl</h1>' + tableHtml + '<br>' + clearInvoiceButtonHtml);
      
   };
   
   var initializeEventHandler = function initializeEventHandler(thisInstance) {
      $(thisInstance.getContainerId()).on('click', 'tr', function () {
         var data = table.row( this ).data();
         bus.sendCommand(cash.client.topics.ADD_ITEMS_TO_INVOICE_COMMAND, [{'name': data.name, 'price': data.price}]);
      } );
      
      $(thisInstance.getContainerId() + '> #clearInvoiceButton').on('click', function() {
         bus.sendCommand(cash.client.topics.REMOVE_ALL_INVOICE_ITEMS_COMMAND, {});
      });
   };
   
   this.getContainerId = function getContainerId() {
      return containerId;
   };
   
   this.initialize = function initialize() {
      initializeContainerContent();
      initializeTable(this);
      initializeEventHandler(this);
      
      bus.subscribeToPublication(cash.topics.PRODUCTRANGE, onProductsReceived.bind(this));
   };
};

cash.ui.InvoiceSidebar.prototype = new cash.ui.UiComponent();