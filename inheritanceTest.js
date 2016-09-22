var Bridge = function Bridge(name, settings, connectionFactoryFunction) {
   console.log('Bridge');
   console.log('Bridge name = ' + name);
   console.log('Bridge settings = ' + settings);
   console.log('Bridge connectionFactoryFunction = ' + connectionFactoryFunction);
}

var clientConnectionFactoryFunction = function clientConnectionFactoryFunction() {};

var ClientBridge = function ClientBridge(settings) {
   console.log('ClientBridge');
   this.prototype = new Bridge('client', settings, clientConnectionFactoryFunction);
}

var serverConnectionFactoryFunction = function serverConnectionFactoryFunction() {};

var ServerBridge = function ServerBridgeBridge(settings) {
   console.log('ServerBridge');
   this.prototype = new Bridge('server', settings, serverConnectionFactoryFunction);
}

new ClientBridge('clientSettings');
new ServerBridge('serverSettings');