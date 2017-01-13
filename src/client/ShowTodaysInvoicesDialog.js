/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a ShowTodaysInvoicesDialog that is invisible after its creation.
 */
cash.ui.ShowTodaysInvoicesDialog = function ShowTodaysInvoicesDialog(containerId, bus) {
      var totalId = containerId + ' #invoiceTotalTable #totalPrice';
      
      var table;
            
      var getTwoDigitsLongNumber = function getTwoDigitsLongNumber(number) {
         return ((number < 10) ? '0' : '') + number;
      };
   
      var initializeTable = function initializeTable(selector) {
         table = $(selector).DataTable({
            data: [],
            columns: [
               { data: 'time' },
               { data: 'total',
                 render: function( data, type, full, meta ) {
                  return data.toFixed(2) + ' €';
                 },
                 className: 'dt-body-right'
               }
            ],
            paging: false,
            searching: false,
            bInfo: false,
            bSort: false
         } );
      };
      
      var getTimeFromTimestamp = function getTimeFromTimestamp(timestamp) {
         var dateInstance = new Date(timestamp);
         var time =  /*dateInstance.getFullYear() + '-' + 
                     getTwoDigitsLongNumber((dateInstance.getMonth() + 1)) + '-' + 
                     getTwoDigitsLongNumber(dateInstance.getDate()) + ' ' + */
                     getTwoDigitsLongNumber(dateInstance.getHours()) + ':' +
                     getTwoDigitsLongNumber(dateInstance.getMinutes()) + ':' +
                     getTwoDigitsLongNumber(dateInstance.getSeconds());
         return time;
      };
      
      var onShowNewProductDialog = function onShowNewProductDialog() {
      };
      
      var onTodaysInvoicesReceived = function onTodaysInvoicesReceived(todaysInvoices) {
         
         var total = 0;
         
         var summarizedInvoices = todaysInvoices.map(function(invoice) {
            var invoiceTotal = 0;
            invoice.items.forEach(function(item) {
               invoiceTotal += item.price;
            });
            
            total += invoiceTotal;
            
            return {time: getTimeFromTimestamp(invoice.timestamp), total: invoiceTotal};
         });
         
         table.clear();
         summarizedInvoices.forEach(function(invoice) {
            table.row.add(invoice);
         });
         table.draw();
         
         $(totalId).html(total.toFixed(2) + ' €');
      };
      
      var onShowTodaysInvoicesDialogReceived = function onShowTodaysInvoicesDialogReceived() {
         this.setVisible(true);
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'Heutige Umsätze ...';
      };
      
      this.getContainerId = function getContainerId() {
         return containerId;
      };
      
      this.shouldCancelButtonBeVisible = function shouldCancelButtonBeVisible() {
         return false;
      };
      
      this.shouldSidebarBeVisible = function shouldSidebarBeVisible() {
         return false;
      };
      
      this.initializeBodyContent = function initializeBodyContent(selector) {
         var totalHtml = '<table id="invoiceTotalTable"><tr><td>Summe:</td><td id="totalPrice"></td></tr></table>';
         var tableHtml = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Uhrzeit</th><th>Summe</th></tr></thead></table>';
         $(selector).html(tableHtml + '<br>' + totalHtml);
         initializeTable(selector + ' #table');
      };
      
      this.completeInitialization = function completeInitialization() {
         bus.subscribeToPublication(cash.topics.TODAYS_INVOICES, onTodaysInvoicesReceived.bind(this));
         bus.subscribeToCommand(cash.client.topics.SHOW_TODAYS_INVOICES_DIALOG_COMMAND, onShowTodaysInvoicesDialogReceived.bind(this));
      };
};

cash.ui.ShowTodaysInvoicesDialog.prototype = new cash.ui.ModalDialog();