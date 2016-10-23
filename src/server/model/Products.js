/* global assertNamespace, cash */

require('../../NamespaceUtils.js');
require('../../SharedTopics.js');

assertNamespace('cash.server.model');


cash.server.model.Products = function Products(bus, database) {
   var PRODUCTS_COLLECTION_NAME = 'products';
   
   var publishProductRange = function publishProductRange() {
      database.getAllDocumentsInCollection(PRODUCTS_COLLECTION_NAME).then(function(productRange) {
         bus.publish(cash.topics.PRODUCTS, productRange);
      });
   };
   
   bus.subscribeToCommand(cash.topics.CREATE_PRODUCT_COMMAND, function(data) {
      if (data.name !== undefined && data.name !== '' && data.price !== undefined && data.price !== '' && !isNaN(parseFloat(data.price))) {
         database.insert(PRODUCTS_COLLECTION_NAME, data).then(publishProductRange);
      }
   });
   
   bus.subscribeToCommand(cash.topics.DELETE_PRODUCT_COMMAND, function(data) {
      database.remove(PRODUCTS_COLLECTION_NAME, data.id).then(publishProductRange);
   });
   
   publishProductRange();
};
 