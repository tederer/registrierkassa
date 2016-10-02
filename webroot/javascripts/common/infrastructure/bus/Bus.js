/* global common, assertNamespace */

require('../../../NamespaceUtils.js');

assertNamespace('common.infrastructure.bus');

common.infrastructure.bus.Bus = (function () {

   var Bus = function Bus() {
      
      var publicationCallbacksPerTopic = {};
      var lastPublishedDataPerTopic = {};
      var commandCallbacksPerTopic = {};

      var add = function add(callback) {
         return { 
            relatedTo: function relatedTo(topic) {
               return {
                  to: function to(map) {
                     if (map[topic] === undefined) {
                        map[topic] = [];
                     }
                     var set = map[topic];
                     set[set.length] = callback;
                  }
               };
            }
         };
      }; 

      var invokeAllCallbacksOf = function invokeAllCallbacksOf(map) {
         return {
            ofType: function ofType(topic) {
               return {
                  withData: function withData(data) {
                     if (map[topic] !== undefined) {
                        map[topic].forEach(function(callback) {
                           callback(data);
                        });
                     }
                  }
               };
            }
         };
      };
      
      this.subscribeToPublication = function subscribeToPublication(topic, callback) {
         if(topic && (typeof callback === 'function')) {
            add(callback).relatedTo(topic).to(publicationCallbacksPerTopic);
            
            var lastPublishedData = lastPublishedDataPerTopic[topic];
            
            if (lastPublishedData) {
               callback(lastPublishedData);
            }
         }
      };
      
      this.subscribeToCommand = function subscribeToCommand(topic, callback) {
         if (topic && (typeof callback === 'function')) {
            add(callback).relatedTo(topic).to(commandCallbacksPerTopic);
         }
      };
      
      this.publish = function publish(topic, data) {
         lastPublishedDataPerTopic[topic] = data;
         invokeAllCallbacksOf(publicationCallbacksPerTopic).ofType(topic).withData(data);
      };
      
      this.sendCommand = function sendCommand(topic, data) {
         invokeAllCallbacksOf(commandCallbacksPerTopic).ofType(topic).withData(data);
      };
   };
   
   return Bus;
}());