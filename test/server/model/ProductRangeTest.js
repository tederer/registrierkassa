/* global global, common, cash, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/server/model/ProductRange.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/common/infrastructure/bus/Bus.js');
require('timers');

var Promise = require('promise');

var bus;
var database;
var productRange;
var capturedInsertation;
var capturedRemoval;
var capturedPublishedProducts;
var insertationWasSuccessful;
var deletionWasSuccessful;
var productsInDatabase;
var numberOfProductsPublications;
var doneFunction;
var doneAfterInsert;
var doneAfterRemove;
var doneAfterGetAllDocuments;
var doneAfterPublicationReceived;
var doneAfterTimeout;

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var TestingDatabase = function TestingDatabase() {
   
   this.insert = function insert(collectionName, document) {
      capturedInsertation = {collectionName: collectionName, document: document};
      
      return new Promise(function(fulfill, reject) {
         if (insertationWasSuccessful === undefined) {
            reject('insertationWasSuccessful is undefined');
            if (doneAfterInsert) {
               doneFunction();
            }
         } else {
            if(insertationWasSuccessful === true) {
               fulfill({});
            } else {
               reject('insertation failed');
            }
            if (doneAfterInsert) {
               doneFunction();
            }
         }
      });
   };
   
   this.remove = function remove(collectionName, documentId) {
      capturedRemoval = {collectionName: collectionName, documentId: documentId};
      return new Promise(function(fulfill, reject) {
         if (deletionWasSuccessful === undefined) {
            reject('deletionWasSuccessful is undefined');
            if (doneAfterRemove) {
               doneFunction();
            }
         } else {
            if(deletionWasSuccessful === true) {
               fulfill({});
            } else {
               reject('deletion failed');
            }
            if (doneAfterRemove) {
               doneFunction();
            }
         }
      });
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName) {
      return new Promise(function(fulfill, reject) {
         if (productsInDatabase === undefined) {
            reject('error');
            if (doneAfterGetAllDocuments) {
               doneFunction();
            }
         } else {
            fulfill(collectionName === 'productRange' ? productsInDatabase : []);
            if (doneAfterGetAllDocuments) {
               doneFunction();
            }
         }
      });
   };
};

var setup = function setup() {
   doneFunction = function() {};
   capturedInsertation = undefined;
   capturedRemoval = undefined;
   capturedPublishedProducts = undefined;
   insertationWasSuccessful = undefined;
   deletionWasSuccessful = undefined;
   productsInDatabase = undefined;
   doneAfterInsert = false;
   doneAfterRemove = false;
   doneAfterGetAllDocuments = false;
   doneAfterPublicationReceived = false;
   doneAfterTimeout = false;
   numberOfProductsPublications = 0;
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();
   productRange = new cash.server.model.ProductRange(bus, database);
   bus.subscribeToPublication(cash.topics.PRODUCTRANGE, function(data) {
      numberOfProductsPublications++;
      capturedPublishedProducts = data;
      if (doneAfterPublicationReceived) {
         doneFunction();
      }
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
   productRange = new cash.server.model.ProductRange(bus, database);   
};

var expecting = function expecting(expectFunction, done) {
   
   doneFunction = function() {
      var error;
      try {
         expectFunction();
      } catch (err) {
         error = err;
      }
      done(error);
   };
};

describe('ProductRange', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a products is an instance/object', function() {
      expect(valueIsAnObject(productRange)).to.be.eql(true);
   });
   
   it('products publishes the products after its creation', function(done) {
      doneAfterPublicationReceived = true;
      
      var productA = {id:1, name:'prod1', price: 20};
      var productB = {id:2, name:'prod2', price: 10};
      
      expecting(function() {
         expect(capturedPublishedProducts).to.be.eql([productA, productB]);
      }, done);
      
      givenTheDatabaseContainsTheProducts([productA, productB]);
      whenANewProductsInstanceGetsCreated();
   });
   
   it('a CREATE_PRODUCT_COMMAND triggers products to add the received data to the database', function(done) {
      doneAfterInsert = true;
      
      var data = {name: 'donald', price: 12.4};
      
      expecting(function() {
         expect(capturedInsertation.collectionName).to.be.eql('productRange');
         expect(capturedInsertation.document).to.be.eql(data);
      }, done);
      
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
   });
   
   it('a CREATE_PRODUCT_COMMAND with an empty name does not trigger products to add the received data to the database', function(done) {
      var data = {name: '', price: 12.4};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);
      
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a CREATE_PRODUCT_COMMAND with an undefined name does not trigger products to add the received data to the database', function(done) {
      var data = {name: undefined, price: 12.4};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);
      
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a CREATE_PRODUCT_COMMAND with an empty price does not trigger products to add the received data to the database', function(done) {
      var data = {name: 'burger', price: ''};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);
      
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a CREATE_PRODUCT_COMMAND with an undefined price does not trigger products to add the received data to the database', function(done) {
      var data = {name: 'burger', price: undefined};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);
      
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a CREATE_PRODUCT_COMMAND with a not parsable price does not trigger products to add the received data to the database', function(done) {
      var data = {name: 'burger', price: 'donald'};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);
      
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('products publishes the products when CREATE_PRODUCT_COMMAND was executed successfully', function(done) {
      doneAfterPublicationReceived = true;
      
      var data = {name: 'daisy', price: 29.9};
      var productA = {id:1, name:'prod1', price: 20};
      var productB = {id:2, name:'prod2', price: 10};
      var productC = {id:3, name:'prod3', price: 15};
      
      expecting(function() {
         expect(capturedPublishedProducts).to.be.eql([productA, productB, productC]);
      }, done);
      
      givenTheDatabaseSuccessfullyHandlesTheInsertation();
      givenTheDatabaseContainsTheProducts([productA, productB, productC]);
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
   });
   
   it('products does not publish the products when CREATE_PRODUCT_COMMAND was not executed successfully', function(done) {
      var data = {name: 'daisy', price: 29.9};
      var productA = {id:1, name:'prod1', price: 20};
      
      expecting(function() {
         expect(numberOfProductsPublications).to.be.eql(0);
      }, done);
      
      givenTheDatabaseDoesNotHandleTheInsertationSuccessfully();
      givenTheDatabaseContainsTheProducts([productA]);
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('products does not publish the products when CREATE_PRODUCT_COMMAND was executed successfully and products query fails', function(done) {
      var data = {name: 'daisy', price: 29.9};
      var productA = {id:1, name:'prod1', price: 20};
      
      expecting(function() {
         expect(numberOfProductsPublications).to.be.eql(0);
      }, done);
      
      givenTheDatabaseSuccessfullyHandlesTheInsertation();
      whenTheCommand(cash.topics.CREATE_PRODUCT_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a DELETE_PRODUCT_COMMAND triggers products to remove the received data from the database', function(done) {
      doneAfterRemove = true;
      
      expecting(function() {
         expect(capturedRemoval.collectionName).to.be.eql('productRange');
         expect(capturedRemoval.documentId).to.be.eql('myId');
      }, done);
      
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 'myId'}).getsSent();
   });
   
   it('products publishes the products when DELETE_PRODUCT_COMMAND was executed successfully', function(done) {
      doneAfterPublicationReceived = true;
      
      var productA = {id:1, name:'prod1', price: 20};
      var productB = {id:2, name:'prod2', price: 10};
      var productC = {id:3, name:'prod3', price: 15};
      
      expecting(function() {
         expect(capturedPublishedProducts).to.be.eql([productA, productC]);
      }, done);
      
      givenTheDatabaseSuccessfullyHandlesTheDeletion();
      givenTheDatabaseContainsTheProducts([productA, productC]);
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 2}).getsSent();
   });
   
   it('products does not publish the products when DELETE_PRODUCT_COMMAND was not executed successfully', function(done) {
      var productA = {id:1, name:'prod1', price: 20};
      
      expecting(function() {
         expect(numberOfProductsPublications).to.be.eql(0);
      }, done);
      
      givenTheDatabaseDoesNotHandleTheDeletionSuccessfully();
      givenTheDatabaseContainsTheProducts([productA]);
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 1}).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('products does not publish the products when DELETE_PRODUCT_COMMAND was executed successfully and products query fails', function(done) {
      expecting(function() {
         expect(numberOfProductsPublications).to.be.eql(0);
      }, done);
      
      givenTheDatabaseSuccessfullyHandlesTheDeletion();
      whenTheCommand(cash.topics.DELETE_PRODUCT_COMMAND).withData({id: 1}).getsSent();
      
      setTimeout(doneFunction, 10);
   });
});  