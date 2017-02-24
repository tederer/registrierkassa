/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a ShowCsvExportDataDialog that is invisible after its creation.
 */
cash.ui.ShowCsvExportDataDialog = function ShowCsvExportDataDialog(containerId, bus) {
      var SEPARATOR = ';';
      var CRLF = '\r\n';
      
      var csvContentId = containerId + ' > #content > #body > #csvExportData';
      
      var getTwoDigitsLongNumber = function getTwoDigitsLongNumber(number) {
         return ((number < 10) ? '0' : '') + number;
      };
   
      var getDateFromTimestamp = function getDateFromTimestamp(timestamp) {
         var dateInstance = new Date(timestamp);
         var date =  dateInstance.getFullYear() + '-' + 
                     getTwoDigitsLongNumber((dateInstance.getMonth() + 1)) + '-' + 
                     getTwoDigitsLongNumber(dateInstance.getDate());
         return date;
      };
      
      var getTimeFromTimestamp = function getTimeFromTimestamp(timestamp) {
         var dateInstance = new Date(timestamp);
         var time =  getTwoDigitsLongNumber(dateInstance.getHours()) + ':' +
                     getTwoDigitsLongNumber(dateInstance.getMinutes()) + ':' +
                     getTwoDigitsLongNumber(dateInstance.getSeconds());
         return time;
      };
      
      var onShowNewProductDialog = function onShowNewProductDialog() {
      };
      
      var onTodaysInvoicesReceived = function onTodaysInvoicesReceived(todaysInvoices) {
         var csvContent = 'Datum' + SEPARATOR + 'Uhrzeit' + SEPARATOR + 'Produkt' + SEPARATOR + 'Preis';
         
         todaysInvoices.forEach(function(invoice) {
            var timestamp = getDateFromTimestamp(invoice.timestamp) + SEPARATOR + getTimeFromTimestamp(invoice.timestamp);
            
            invoice.items.forEach(function(item) {
               csvContent += CRLF + timestamp + SEPARATOR + item.name + SEPARATOR + item.price.toLocaleString();
            });
         });
         
         $(csvContentId).val(csvContent);
      };
      
      var onShowCsvExportDataDialogReceived = function onShowCsvExportDataDialogReceived() {
         this.setVisible(true);
      };
      
      this.getDialogTitle = function getDialogTitle() {
         return 'CSV Export Daten der heutigen Umsätze';
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
         $(selector).html('<textarea id="csvExportData"></textarea>');
      };
      
      this.completeInitialization = function completeInitialization() {
         bus.subscribeToPublication(cash.topics.TODAYS_INVOICES, onTodaysInvoicesReceived.bind(this));
         bus.subscribeToCommand(cash.client.topics.SHOW_CSV_EXPORT_DATA_DIALOG_COMMAND, onShowCsvExportDataDialogReceived.bind(this));
      };
};

cash.ui.ShowCsvExportDataDialog.prototype = new cash.ui.ModalDialog();