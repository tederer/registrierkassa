/* global global, common, cash, Map */

require(global.PROJECT_SOURCE_ROOT_PATH + '/server/model/Products.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/common/infrastructure/bus/Bus.js');

var bus;
var database;
var products;
var capturedCollectionName;
var capturedDocument;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var TestingDatabase = function TestingDatabase() {
   this.insert = function insert(collectionName, document) {
      capturedCollectionName = collectionName;
      capturedDocument = document;
   };
   
   this.remove = function remove(collectionName, documentId) {};
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName, callback) {};
};

var setup = function setup() {
   capturedDocument = undefined;
   capturedCollectionName = undefined;
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
      expect(capturedCollectionName).to.be.eql('products');
      expect(capturedDocument).to.be.eql(data);
   });
});  