/* global assertNamespace, cash */

require('../NamespaceUtils.js');
require('../SharedTopics.js');

var Promise = require('promise');

assertNamespace('cash.server');


cash.server.TodaysInvoicesPublisher = function TodaysInvoicesPublisher(bus, database, optionals) {
   
   var loggingDisabled = (optionals === undefined || optionals.loggingDisabled === undefined) ? false : optionals.loggingDisabled;
   var getTimeInMillis = (optionals === undefined || optionals.timeFunction === undefined) ? Date.now : optionals.timeFunction;
   
   var cashCollectionName;
   
   var writeErrorToConsole = function writeErrorToConsole(error) {
      if (!loggingDisabled) {
         console.log(error);
      }
   };
   
   var descending = function descending(first, second) {
      var result = 0;
      
      if (first.timestamp !== second.timestamp) {
         result = (first.timestamp < second.timestamp) ? 1 : -1;
      }

      return result;
   };
   
   var publishInvoices = function publishInvoices(documents) {
      // documents is an array of {id:2, timestamp:1478883481579, items:[{name: 'Apfel', price: 2.5},{name: 'Parmesan', price: 23}]}
      return new Promise(function(fulfill, reject) {
         bus.publish(cash.topics.TODAYS_INVOICES, documents.sort(descending));
         fulfill();
      });
   };
   
   var getTwoDigitLogNumber = function getTwoDigitLogNumber(number) {
         return ((number < 10) ? '0' : '') + number;
   };
   
   bus.subscribeToPublication(cash.server.topics.CASH_COLLECTION_NAME, function(collectionName) {
      cashCollectionName = collectionName;
      database.getAllDocumentsInCollectionInTimespan(cashCollectionName, 0, 0).then(publishInvoices, writeErrorToConsole);
   });
   
   bus.subscribeToCommand(cash.server.topics.NEW_INVOICE_ADDED_COMMAND, function(data) {
      var now = new Date(getTimeInMillis());
      var isoMinimumTimestamp = now.getFullYear() + '-' + getTwoDigitLogNumber((now.getMonth() + 1)) + '-' + getTwoDigitLogNumber(now.getDate()) + 'T00:00:00Z';
      var nowMidnight = new Date(isoMinimumTimestamp);
      var minimumTimestamp = nowMidnight.getTime();
      var maximumTimestamp = minimumTimestamp + 24 * 60 * 60 * 1000 - 1;
      
      database.getAllDocumentsInCollectionInTimespan(cashCollectionName, minimumTimestamp, maximumTimestamp).then(publishInvoices, writeErrorToConsole);
   });
};
 