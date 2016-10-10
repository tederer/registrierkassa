/* global assertNamespace, cash */

require('../../NamespaceUtils.js');
require('../../SharedTopics.js');

assertNamespace('cash.server.model');


cash.server.model.Products = function Products(bus, database) {
   bus.subscribeToCommand(cash.topics.CREATE_PRODUCT_COMMAND, function(data) {
      database.insert('products', data);
   });
   
   bus.subscribeToCommand(cash.topics.DELETE_PRODUCT_COMMAND, function(data) {
      database.remove('products', data.id);
   });
};
 