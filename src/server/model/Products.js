/* global assertNamespace, cash */

require('../../NamespaceUtils.js');
require('../../SharedTopics.js');

assertNamespace('cash.server.model');


cash.server.model.Products = function Products(bus, database) {
   var PRODUCTS_COLLECTION_NAME = 'products';
   
   var productsCallback = function productsCallback(err, result) {
      if (!err) {
         bus.publish(cash.topics.PRODUCTS, result);
      }
   };
   
   var insertCallback = function insertCallback(err, result) {
      if (!err) {
         database.getAllDocumentsInCollection(PRODUCTS_COLLECTION_NAME, productsCallback);
      }
   };
   
   bus.subscribeToCommand(cash.topics.CREATE_PRODUCT_COMMAND, function(data) {
      database.insert(PRODUCTS_COLLECTION_NAME, data, insertCallback);
   });
   
   bus.subscribeToCommand(cash.topics.DELETE_PRODUCT_COMMAND, function(data) {
      database.remove(PRODUCTS_COLLECTION_NAME, data.id);
   });
   
   database.getAllDocumentsInCollection(PRODUCTS_COLLECTION_NAME, productsCallback);
};
 