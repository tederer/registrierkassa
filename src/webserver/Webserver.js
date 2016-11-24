/* global setInterval, common, cash */
require('../SharedTopics.js');
require('../server/ServerTopics.js');
require('../common/infrastructure/bus/Bus.js');
require('../common/infrastructure/busbridge/ServerSocketIoBusBridge.js');
require('../server/database/TingoDbDatabase.js');
require('../server/model/ProductRange.js');
require('../server/Cash.js');
require('../server/TodaysInvoicesPublisher.js');

var FileSystem = require('../utils/FileSystem.js');
var fileSystem = new FileSystem();
var express = require('express');

var WEB_ROOT_FOLDER        = 'webroot';
var DATABASE_ROOT_FOLDER   = 'database';
var SERVER_PORT            = 8080;
var LOGGING_ENABLED        = false;

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var counter = 0;

var addToLog = function addToLog(message) {
   if (LOGGING_ENABLED) {
      console.log(message);
   }
};

var logRequest = function logRequest(request,response, next) {

   addToLog('\nREQUEST for "' + request.url + '" received');
   next();
};


var replaceSpacesInRequestUrlByEscapeSequence = function replaceSpacesInRequestUrlByEscapeSequence(request,response, next) {

   request.url = request.url.replace(/%20/g, ' ');
   next();
};


var sendInternalServerError = function sendInternalServerError(response, text) {
   
   addToLog('Sending error status 500 because of: ' + text);
   response.writeHeader(500, {'Content-Type': 'text/plain'});  
   response.write(text);  
   response.end();
};


var sendOkResponse = function sendOkResponse(response, content) {
   
   response.writeHeader(200, {'Content-Type': 'text/html'});  
   response.write(content);  
   response.end();
};


var handleFileRequests = function handleFileRequests(request,response) {

   var requestedDocumentUrl = request.url;
   
   addToLog('\n--- handleFileRequests ---');
   addToLog('requestedDocumentUrl: ' + requestedDocumentUrl);
   
   var absolutePathOfRequest = WEB_ROOT_FOLDER + requestedDocumentUrl;
      
   if (!fileSystem.exists(absolutePathOfRequest)) {
      
      sendInternalServerError(response, 'file ' + absolutePathOfRequest + ' does not exist');
      
   } else {

      addToLog('returning ' + absolutePathOfRequest);
      response.sendFile(requestedDocumentUrl, { root: WEB_ROOT_FOLDER } );
   }
};
   
var counter = 1;

var Constructor = function Constructor() {
	
   var thisInstance = this;
   var counter = 0;
   
	this.start = function start() {
	
      var bus = new common.infrastructure.bus.Bus();
      var database = new cash.server.database.TingoDbDatabase(DATABASE_ROOT_FOLDER);
      var productRange = new cash.server.model.ProductRange(bus, database);
      var cashInstance = new cash.server.Cash(bus, database);
      var todaysInvoicePublisher = new cash.server.TodaysInvoicesPublisher(bus, database);
      
      bus.subscribeToPublication(common.infrastructure.busbridge.CONNECTION_STATE_TOPIC, function(data) {
         console.log(common.infrastructure.busbridge.CONNECTION_STATE_TOPIC + ' = ' + data);
      });
      
      bus.subscribeToPublication('/message', function(data) {
         console.log('message = ' + data);
      });
      
      var topicsToTransmit = [cash.topics.PRODUCTRANGE, cash.topics.TODAYS_INVOICES];
      var busBridge = new common.infrastructure.busbridge.ServerSocketIoBusBridge(bus, topicsToTransmit, io);
      
      //setInterval( function() {bus.publish('counter', counter++);}, 1000 );
      // app.get(path, callback [, callback ...])
		// Routes HTTP GET requests to the specified path to the specified callback functions. 
		app.get('*', replaceSpacesInRequestUrlByEscapeSequence);
		app.get('*', logRequest);
		app.get('*', handleFileRequests );
		
		console.log('starting webserver ...');

      server.listen(SERVER_PORT, function (listeningEvent) {
			var host = server.address().address;
			var port = server.address().port;
			console.log('listening at http://%s:%s', host, port);
		});
	};
};

module.exports = Constructor;
