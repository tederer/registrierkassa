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
      var sortedProducts = products.sort(function(first, second) {
         var result = 0;
         
         if (first.name !== second.name) {
            result = (first.name < second.name) ? -1 : 1;
         }
         
         return result;
      });
      
      table.clear();
      products.forEach(function(product) {
         table.row.add(product);
      });
      table.draw();
   };
      
   var initializeContainerContent = function initializeContainerContent() {
      var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"></table>';
      $(containerId).html('<div id="header"><h2>Produktauswahl</h1></div><div id="products">' + tableHtml + '</div>');
      
   };
   
   var initializeEventHandler = function initializeEventHandler(thisInstance) {
      $(thisInstance.getContainerId()).on('click', 'tr', function () {
         var data = table.row( this ).data();
         bus.sendCommand(cash.client.topics.ADD_ITEMS_TO_INVOICE_COMMAND, [{'name': data.name, 'price': data.price}]);
      } );
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