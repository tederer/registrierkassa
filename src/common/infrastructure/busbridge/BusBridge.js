/* global common, assertNamespace, io */

require('../../../NamespaceUtils.js');
require('./MessageFactory.js');
require('./connection/ClientSocketIoConnection.js');
require('./connection/ServerSocketIoConnection.js');

assertNamespace('common.infrastructure.busbridge');

common.infrastructure.busbridge.CONNECTION_STATE_TOPIC = 'busbridge.connected';

/**
 * A BusBridge connects two busses by using a transport media (e.g. socket.io)
 * and it has the following responsibilities:
 *    1. transmit all commands and publications, the bridge is interested in, to the other bus
 *    2. publish all commands and publications received from the other bus
 *    3. publish the connection state of the bridge on the CONNECTION_STATE_TOPIC
 */

/**
 * constructor for a BusBridge.
 *
 * bus                        the local bus instance
 * topicsToTransmit           an Array of topics that should get transmitted via the bridge
 * connectionFactoryFunction  a function that returns either a ClientSocketIoConnection or a ServerSocketIoConnection (located in common.infrastructure.busbridge.connection).
 */
common.infrastructure.busbridge.BusBridge = function BusBridge(bus, topicsToTransmit, connectionFactoryFunction) {

   var lastReceivedPublicationByTopic = {};
   var lastReceivedCommandByTopic = {};
   
   var onConnectCallback = function onConnectCallback() {
      bus.publish(common.infrastructure.busbridge.CONNECTION_STATE_TOPIC, 'true');
   };
   
   var onDisconnectCallback = function onDisconnectCallback() {
      bus.publish(common.infrastructure.busbridge.CONNECTION_STATE_TOPIC, 'false');
   };
   
   var ifTheTopicOfTheIncomingMessageIsNotOneOfTheTopicsTheBridgeTransmitsThen = function ifTheTopicOfTheIncomingMessageIsNotOneOfTheTopicsTheBridgeTransmitsThen(topic, action) {
      if (topicsToTransmit.indexOf(topic) === -1) {
            action();
         }
   };
   
   var onMessageCallback = function onMessageCallback(message) {
      if (message.type === 'PUBLICATION') {
         lastReceivedPublicationByTopic[message.topic] = message.data;
         bus.publish(message.topic, message.data);
      } else if (message.type === 'COMMAND') {
         lastReceivedCommandByTopic[message.topic] = message.data;
         bus.sendCommand(message.topic, message.data);
      }
   };

   var connection = connectionFactoryFunction(onConnectCallback, onDisconnectCallback, onMessageCallback);
   
   bus.publish(common.infrastructure.busbridge.CONNECTION_STATE_TOPIC, 'false');

   topicsToTransmit.forEach(function(topic) {
      bus.subscribeToPublication(topic, function(data) {
         var lastReceivedPublication = lastReceivedPublicationByTopic[topic];
         
         if (data !== lastReceivedPublication) {
            var message = common.infrastructure.busbridge.MessageFactory.createPublicationMessage(topic, data);
            connection.send(message);
         }
      });
      bus.subscribeToCommand(topic, function(data) {
         var lastReceivedCommand = lastReceivedCommandByTopic[topic];
         
         if (data !== lastReceivedCommand) {
            var message = common.infrastructure.busbridge.MessageFactory.createCommandMessage(topic, data);
            connection.send(message);
         }
      });
   });
};
 