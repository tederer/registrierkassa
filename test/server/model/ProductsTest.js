/* global global, common, cash, Map */

require(global.PROJECT_SOURCE_ROOT_PATH + '/server/model/Products.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/common/infrastructure/bus/Bus.js');

var bus;
var database;
var products;
var capturedInsertation;
var capturedRemoval;
var capturedPublishedProducts;
var insertationWasSuccessful;
var deletionWasSuccessful;
var productsInDatabase;
var numberOfProductsPublications;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var TestingDatabase = function TestingDatabase() {
   
   this.insert = function insert(collectionName, document, callback) {
      capturedInsertation = {collectionName: collectionName, document: document};
      if (insertationWasSuccessful === undefined) {
         callback('error', null);
      } else {
         callback(insertationWasSuccessful === true ? null : 'Error', insertationWasSuccessful === true ? {} : null);
      }
   };
   
   this.remove = function remove(collectionName, documentId, callback) {
      capturedRemoval = {collectionName: collectionName, documentId: documentId};
      if (deletionWasSuccessful === undefined) {
         callback('error', null);
      } else {
         callback(deletionWasSuccessful === true ? null : 'Error', deletionWasSuccessful === true ? {} : null);
      }
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName, callback) {
      if (productsInDatabase === undefined) {
         callback('error', null);
      } else {
         callback(null, collectionName === 'products' ? productsInDatabase : []);
      }
   };
};

var setup = function setup() {
   capturedInsertation = undefined;
   capturedRemoval = undefined;
   capturedPublishedProducts = undefined;
   insertationWasSuccessful = undefined;
   deletionWasSuccessful = undefined;
   productsInDatabase = undefined;
   numberOfProductsPublications = 0;
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();
   products = new cash.server.model.Products(bus, database);
   bus.subscribeToPublication(cash.topics.PRODUCTS, function(data) {
      numberOfProductsPublications++;
      capturedPublishedProducts = data;
   });
};

var givenTheDatabaseContainsTheProducts = function givenTheDatabaseContainsTheProducts(products) {
   productsInDatabase = products;
};

var givenTheDatabaseSuccessfullyHandlesTheInsertation = function givenTheDatabaseSuccessfullyHandlesTheInsertation() {
   insertationWasSuccessful = true;
};

var givenTheDatabaseDoesNotHandleTheInsertationSuccessfully = function givenTheDatabaseDoesNotHandleTheInsertationSuccessfully() {
   insertationWasSuccessful = false;
};

var givenTheDatabaseSuccessfullyHandlesTheDeletion = function givenTheDatabaseSuccessfullyHandlesTheDeletion() {
   deletionWasSuccessful = true;
};

var givenTheDatabaseDoesNotHandleTheDeletionSuccessfully = function givenTheDatabaseDoesNotHandleTheDeletionSuccessfully() {
   deletionWasSuccessful = false;
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

var whenANewProductsInstanceGetsCreated = function whenANewProductsInstanceGetsCreated() {
   products = new cash.server.model.Products(bus, database);   
};

describe('Products', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a products is an instance/object', function() {
      
      expect(valueIsAnObject(products)).to.be.eql(true);
   });
   
   it('products publishes the products after its creation', function() {
      
      var productA = {id:1, name:'prod1', price: 20};
      var productB = {id:2, name:'prod2', price: 10};
      
      givenTheDatabaseContainsTheProducts([productA, productB]);
      whenANewProductsInstanceGetsCreated();
      expect(capturedPublishedProducts).to.be.eql([productA, productB]);
   });
   
   it('a CREATE_PRODUCT_COMMAND triggers products to add the received data to the database', function() {
      
      var data = {name: 'donald', price: 12.4};
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      expect(capturedInsertation.collectionName).to.be.eql('products');
      expect(capturedInsertation.document).to.be.eql(data);
   });
   
   it('products publishes the products when CREATE_PRODUCT_COMMAND was executed successfully', function() {
      
      var data = {name: 'daisy', price: 29.9};
      var productA = {id:1, name:'prod1', price: 20};
      var productB = {id:2, name:'prod2', price: 10};
      var productC = {id:3, name:'prod3', price: 15};
      
      givenTheDatabaseSuccessfullyHandlesTheInsertation();
      givenTheDatabaseContainsTheProducts([productA, productB, productC]);
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      expect(capturedPublishedProducts).to.be.eql([productA, productB, productC]);
   });
   
   it('products does not publish the products when CREATE_PRODUCT_COMMAND was not executed successfully', function() {
      
      var data = {name: 'daisy', price: 29.9};
      var productA = {id:1, name:'prod1', price: 20};
      
      givenTheDatabaseDoesNotHandleTheInsertationSuccessfully();
      givenTheDatabaseContainsTheProducts([productA]);
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      expect(numberOfProductsPublications).to.be.eql(0);
   });
   
   it('products does not publish the products when CREATE_PRODUCT_COMMAND was executed successfully and products query fails', function() {
      
      var data = {name: 'daisy', price: 29.9};
      var productA = {id:1, name:'prod1', price: 20};
      
      givenTheDatabaseSuccessfullyHandlesTheInsertation();
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      expect(numberOfProductsPublications).to.be.eql(0);
   });
   
   it('a DELETE_PRODUCT_COMMAND triggers products to remove the received data from the database', function() {
      
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 'myId'}).getsSent();
      expect(capturedRemoval.collectionName).to.be.eql('products');
      expect(capturedRemoval.documentId).to.be.eql('myId');
   });
   
   it('products publishes the products when DELETE_PRODUCT_COMMAND was executed successfully', function() {
      
      var productA = {id:1, name:'prod1', price: 20};
      var productB = {id:2, name:'prod2', price: 10};
      var productC = {id:3, name:'prod3', price: 15};
      
      givenTheDatabaseSuccessfullyHandlesTheDeletion();
      givenTheDatabaseContainsTheProducts([productA, productC]);
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 2}).getsSent();
      expect(capturedPublishedProducts).to.be.eql([productA, productC]);
   });
   
   it('products does not publish the products when DELETE_PRODUCT_COMMAND was not executed successfully', function() {
      
      var productA = {id:1, name:'prod1', price: 20};
      
      givenTheDatabaseDoesNotHandleTheDeletionSuccessfully();
      givenTheDatabaseContainsTheProducts([productA]);
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 1}).getsSent();
      expect(numberOfProductsPublications).to.be.eql(0);
   });
   
   it('products does not publish the products when DELETE_PRODUCT_COMMAND was executed successfully and products query fails', function() {
      
      givenTheDatabaseSuccessfullyHandlesTheDeletion();
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 1}).getsSent();
      expect(numberOfProductsPublications).to.be.eql(0);
   });
});  