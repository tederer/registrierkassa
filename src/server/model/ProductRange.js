/* global assertNamespace, cash */

require('../../NamespaceUtils.js');
require('../../SharedTopics.js');

assertNamespace('cash.server.model');


cash.server.model.ProductRange = function ProductRange(bus, database) {
   var PRODUCT_RANGE_COLLECTION_NAME = 'productRange';
   
   var publishProductRange = function publishProductRange() {
      database.getAllDocumentsInCollection(PRODUCT_RANGE_COLLECTION_NAME).then(function(productRange) {
         bus.publish(cash.topics.PRODUCTRANGE, productRange);
      });
   };
   
   bus.subscribeToCommand(cash.topics.CREATE_PRODUCT_COMMAND, function(data) {
      if (data.name !== undefined && data.name !== '' && data.price !== undefined && data.price !== '' && !isNaN(parseFloat(data.price))) {
         database.insert(PRODUCT_RANGE_COLLECTION_NAME, data).then(publishProductRange);
      }
   });
   
   bus.subscribeToCommand(cash.topics.DELETE_PRODUCT_COMMAND, function(data) {
      database.remove(PRODUCT_RANGE_COLLECTION_NAME, data.id).then(publishProductRange);
   });
   
   publishProductRange();
};
 