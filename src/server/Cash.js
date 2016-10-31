/* global assertNamespace, cash */

require('../NamespaceUtils.js');
require('../SharedTopics.js');

var Promise = require('promise');

assertNamespace('cash.server');


cash.server.Cash = function Cash(bus, database, loggingDisabled) {
   var CASH_COLLECTION_NAME = 'cash';
   var processedInvoiceIds = [];
   
   var writeErrorToConsole = function writeErrorToConsole(error) {
      if (!loggingDisabled) {
         console.log(error);
      }
   };
   
   var createDocument = function createDocument(data) {
      return new Promise(function(fulfill, reject) {
      
         var document = [];
         var invalidItems = [];
         
         if (data.id === undefined || data.id === '') {
            reject('invalid or not available ID');
         }
         
         if (processedInvoiceIds.findIndex(function(currentId) { return currentId === data.id; }) >= 0) {
            reject('invoice id ' + data.id + ' already processed');
         }
         
         processedInvoiceIds[processedInvoiceIds.length] = data.id;
         
         if (data.items === undefined || data.items.length === 0) {
            reject('no items are available');
         }
         
         data.items.forEach(function(item) {
            if (item.name !== undefined && item.name !== '' && item.price !== undefined && item.price !== '' && !isNaN(parseFloat(item.price))) {
               document[document.length] = {name: item.name, price: parseFloat(item.price)};
            } else {
               invalidItems[invalidItems.length] = item;
            }
         });
         
         if (invalidItems.length > 0) {
            reject('invalid item(s): ' + JSON.stringify(invalidItems));
         }
         
         fulfill(document);
      });
   };
   
   var acknowledgeInvoice = function acknowledgeInvoice(invoiceId) {
      bus.sendCommand(cash.topics.ACKNOWLEDGE_INVOICE_COMMAND, {id: invoiceId});
   };
   
   var rejectInvoice = function rejectInvoice(invoiceId, errorMessage) {
      writeErrorToConsole(errorMessage);
      bus.sendCommand(cash.topics.REJECT_INVOICE_COMMAND, {id: invoiceId, error: errorMessage});
   };
   
   bus.subscribeToCommand(cash.topics.CREATE_INVOICE_COMMAND, function(data) {
      createDocument(data)
         .then(database.insert.bind(null, CASH_COLLECTION_NAME))
         .then(acknowledgeInvoice.bind(null, data.id), rejectInvoice.bind(null, data.id));
   });
};
 