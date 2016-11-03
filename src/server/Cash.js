/* global assertNamespace, cash */

require('../NamespaceUtils.js');
require('../SharedTopics.js');

var Promise = require('promise');

assertNamespace('cash.server');


cash.server.Cash = function Cash(bus, database, optionals) {
   
   var loggingDisabled = (optionals === undefined || optionals.loggingDisabled === undefined) ? false : optionals.loggingDisabled;
   var getTimeInMillis = (optionals === undefined || optionals.timeFunction === undefined) ? Date.now : optionals.timeFunction;

   var CASH_COLLECTION_NAME = 'cash';
   var ID_TIME_TO_LIVE_IN_MILLIS = 60 * 60 * 1000;
   
   var processedInvoiceIds = [];
   
   var writeErrorToConsole = function writeErrorToConsole(error) {
      if (!loggingDisabled) {
         console.log(error);
      }
   };
   
   var removeExpiredIds = function removeExpiredIds(nowInMillis) {
      var firstNotOutdatedEntryIndex = -1;
      
      for (var index = 0; index < processedInvoiceIds.length; index++) {
         var ageOfIdInMillis = nowInMillis - processedInvoiceIds[index].timestamp;
         if (ageOfIdInMillis < ID_TIME_TO_LIVE_IN_MILLIS) {
            firstNotOutdatedEntryIndex = index;
            break;
         }
      }
      
      if (firstNotOutdatedEntryIndex >= 0) {
            processedInvoiceIds.slice(firstNotOutdatedEntryIndex);
      } else {
         processedInvoiceIds = [];
      }
   };
   
   var createDocument = function createDocument(data) {
      return new Promise(function(fulfill, reject) {
      
         var document = [];
         var invalidItems = [];
         var nowInMillis = getTimeInMillis();
      
         if (data.id === undefined || data.id === '') {
            reject('invalid or not available ID');
         }
         
         removeExpiredIds(nowInMillis);
      
         if (processedInvoiceIds.findIndex(function(currentId) { return currentId.id === data.id; }) >= 0) {
            reject('invoice id ' + data.id + ' already processed');
         }
         
         processedInvoiceIds[processedInvoiceIds.length] = {id: data.id, timestamp: nowInMillis};
         
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
 