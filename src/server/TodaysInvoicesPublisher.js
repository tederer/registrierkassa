/* global assertNamespace, cash */

require('../NamespaceUtils.js');
require('../SharedTopics.js');

var Promise = require('promise');

assertNamespace('cash.server');


cash.server.TodaysInvoicesPublisher = function TodaysInvoicesPublisher(bus, database, optionals) {
   
   var loggingDisabled = (optionals === undefined || optionals.loggingDisabled === undefined) ? false : optionals.loggingDisabled;
   var cashCollectionName;
   
   var writeErrorToConsole = function writeErrorToConsole(error) {
      if (!loggingDisabled) {
         console.log(error);
      }
   };
   
   var publishInvoices = function publishInvoices(documents) {
      // documents is an array of {id:2, timestamp:1478883481579, items:[{name: 'Apfel', price: 2.5},{name: 'Parmesan', price: 23}]}
      return new Promise(function(fulfill, reject) {
         bus.publish(cash.topics.TODAYS_INVOICES, documents);
         fulfill();
      });
   };
   
   bus.subscribeToPublication(cash.server.topics.CASH_COLLECTION_NAME, function(collectionName) {
      cashCollectionName = collectionName;
      database.getAllDocumentsInCollection(cashCollectionName).then(publishInvoices, writeErrorToConsole);
   });
   
   bus.subscribeToCommand(cash.server.topics.NEW_INVOICE_ADDED_COMMAND, function(data) {
      database.getAllDocumentsInCollection(cashCollectionName).then(publishInvoices, writeErrorToConsole);
   });
};
 