/* global assertNamespace, cash */

require('../../NamespaceUtils.js');
require('../../SharedTopics.js');

assertNamespace('cash.server.model');


cash.server.model.ProductRange = function ProductRange(bus, database, loggingEnabled) {
   var PRODUCT_RANGE_COLLECTION_NAME = 'productRange';
   
   var writeErrorToConsole = function writeErrorToConsole(error) {
      if (loggingEnabled) {
         console.log(error);
      }
   };
   
   var createDocument = function createDocument(data) {
      var document;
      
      if (data.name !== undefined && data.name !== '' && data.price !== undefined && data.price !== '' && !isNaN(parseFloat(data.price))) {
         document = {name: data.name, price: parseFloat(data.price)};
      }
      
      return document;
   };
   
   var publishProductRange = function publishProductRange() {
      database.getAllDocumentsInCollection(PRODUCT_RANGE_COLLECTION_NAME).then(function(productRange) {
         bus.publish(cash.topics.PRODUCTRANGE, productRange);
      });
   };
   
   bus.subscribeToCommand(cash.topics.CREATE_PRODUCT_COMMAND, function(data) {
      var documentToInsert = createDocument(data);
      if (documentToInsert !== undefined) {
         database.insert(PRODUCT_RANGE_COLLECTION_NAME, documentToInsert).then(publishProductRange, writeErrorToConsole);
      }
   });
   
   bus.subscribeToCommand(cash.topics.UPDATE_PRODUCT_COMMAND, function(data) {
      var documentToUpdate = createDocument(data);
      if (documentToUpdate !== undefined) {
         database.update(PRODUCT_RANGE_COLLECTION_NAME, data.id, documentToUpdate).then(publishProductRange, writeErrorToConsole);
      }
   });
   
   bus.subscribeToCommand(cash.topics.DELETE_PRODUCT_COMMAND, function(data) {
      database.remove(PRODUCT_RANGE_COLLECTION_NAME, data.id).then(publishProductRange, writeErrorToConsole);
   });
   
   publishProductRange();
};
 