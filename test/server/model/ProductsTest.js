/* global global, common, cash, Map */

require(global.PROJECT_SOURCE_ROOT_PATH + '/server/model/Products.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/common/infrastructure/bus/Bus.js');

var bus;
var database;
var products;
var capturedInsertation;
var capturedRemoval;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var TestingDatabase = function TestingDatabase() {
   
   this.insert = function insert(collectionName, document) {
      capturedInsertation = {collectionName: collectionName, document: document};
   };
   
   this.remove = function remove(collectionName, documentId) {
      capturedRemoval = {collectionName: collectionName, documentId: documentId};
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName, callback) {};
};

var setup = function setup() {
   capturedInsertation = undefined;
   capturedRemoval = undefined;
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();
   products = new cash.server.model.Products(bus, database);
};

var whenTheCommand = function whenTheCommand(commandTopic) {
   return {
      withData: function withData(data) {
         return {
            getsSent: function getsSent() {
               bus.sendCommand(commandTopic, data);
            }
         };
      }
   };
};

describe('Products', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a products is an instance/object', function() {
      
      expect(valueIsAnObject(products)).to.be.eql(true);
   });
   
   it('a CREATE_PRODUCT_COMMAND triggers products to add the received data to the database', function() {
      
      var data = {name: 'donald', price: 12.4};
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      expect(capturedInsertation.collectionName).to.be.eql('products');
      expect(capturedInsertation.document).to.be.eql(data);
   });
   
   it('a DELETE_PRODUCT_COMMAND triggers products to add the received data to the database', function() {
      
      var data = {id: 'myId'};
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData(data).getsSent();
      expect(capturedRemoval.collectionName).to.be.eql('products');
      expect(capturedRemoval.documentId).to.be.eql('myId');
   });
});  