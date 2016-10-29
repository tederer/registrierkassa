/* global assertNamespace, cash */

require('../NamespaceUtils.js');
require('../SharedTopics.js');

assertNamespace('cash.server');


cash.server.Cash = function Cash(bus, database, loggingEnabled) {
   
   var writeErrorToConsole = function writeErrorToConsole(error) {
      if (loggingEnabled) {
         console.log(error);
      }
   };

   /*bus.subscribeToCommand(cash.topics.DELETE_PRODUCT_COMMAND, function(data) {
      database.remove(PRODUCT_RANGE_COLLECTION_NAME, data.id).then(publishProductRange, writeErrorToConsole);
   });*/
};
 