/* global global, common, cash, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/server/ServerTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/common/infrastructure/bus/Bus.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/server/TodaysInvoicesPublisher.js');
require('timers');

var Promise = require('promise');

var bus;
var database;
var publisherInstance;
var doneFunction;
var doneAfterInvoicesReceived;
var capturedRequests;
var capturedInvoices;
var getAllDocumentsInCollectionInTimespanWasSuccessful;
var documentsInCollection;
var numberOfExpectedPublicationsReached;
var timeInMillis;

var TestingDatabase = function TestingDatabase() {
   
   this.insert = function insert(collectionName, document) {
      return new Promise(function(fulfill, reject) {
         reject('insert not implemented in TestingDatabase');
      });
   
   };
   
   this.update = function update(collectionName, documentId, document) {
      return new Promise(function(fulfill, reject) {
         reject('update not implemented in TestingDatabase');
      });
   };
   
   this.remove = function remove(collectionName, documentId) {
      return new Promise(function(fulfill, reject) {
         reject('remove not implemented in TestingDatabase');
      });
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName) {
      return new Promise(function(fulfill, reject) {
         reject('getAllDocumentsInCollection not implemented in TestingDatabase');
      });
   };
   
   this.getAllDocumentsInCollectionInTimespan = function getAllDocumentsInCollectionInTimespan(collectionName, minimumTimestamp, maximumTimestamp) {
      capturedRequests[capturedRequests.length] = {collectionName:collectionName, minimumTimestamp: minimumTimestamp, maximumTimestamp: maximumTimestamp};
      
      return new Promise(function(fulfill, reject) {
         if (getAllDocumentsInCollectionInTimespanWasSuccessful === undefined) {
            reject('getAllDocumentsInCollectionInTimespanWasSuccessful is undefined');
         } else {
            if(getAllDocumentsInCollectionInTimespanWasSuccessful === true) {
               fulfill(documentsInCollection);
            } else {
               reject('getAllDocumentsInCollectionInTimespanWasSuccessful failed');
            }
         }
      });
   };
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var getWithData = function getWithData(commandTopic, busFunction) {
   return {
      withData: function withData(data) {
         return {
            getsSent: function getsSent() {
               busFunction(commandTopic, data);
            }
         };
      }
   };
};

var givenTheCommand = function givenTheCommand(commandTopic) {
   return getWithData(commandTopic, bus.sendCommand);
};

var givenThePublication = function givenThePublication(publicationTopic) {
   return getWithData(publicationTopic, bus.publish);
};

var givenTheExpectedNumberOfPublicationsIs = function givenTheExpectedNumberOfPublicationIs(numberOfPublication) {
   numberOfExpectedPublicationsReached = function() {
      return capturedInvoices.length === numberOfPublication;
   };
};

var whenTheCommand = function whenTheCommand(commandTopic) {
   return getWithData(commandTopic, bus.sendCommand);
};

var whenThePublication = function whenThePublication(publicationTopic) {
   return getWithData(publicationTopic, bus.publish);
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

var setup = function setup() {
   
   timeInMillis = 0;
   doneFunction = function() {};
   doneAfterInvoicesReceived = false;
   numberOfExpectedPublicationsReached = function() {return false;};
   capturedRequests = [];
   capturedInvoices = [];
   getAllDocumentsInCollectionInTimespanWasSuccessful = undefined;
   documentsInCollection = undefined;
   
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();

   bus.subscribeToPublication(cash.topics.TODAYS_INVOICES, function(data) {
      capturedInvoices[capturedInvoices.length] = data;
      if (doneAfterInvoicesReceived || numberOfExpectedPublicationsReached()) {
         doneFunction();
      }
   });
   
   var optionals = { loggingDisabled: true, timeFunction: function() { return timeInMillis;}};
   publisherInstance = new cash.server.TodaysInvoicesPublisher(bus, database, optionals);
};


describe('TodaysInvoidesPublisher', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a cash is an instance/object', function() {
      expect(valueIsAnObject(publisherInstance)).to.be.eql(true);
   });
   
   it('the database gets asked for all documents in the provided collection when the collection name publication is received', function() {
      whenThePublication(cash.server.topics.CASH_COLLECTION_NAME).withData('CollectionA').getsSent();
      expect(capturedRequests.length).to.be.eql(1);
      expect(capturedRequests[0].collectionName).to.be.eql('CollectionA');
   });
   
   it('the invoices get published when the collection name publication is received', function(done) {
      doneAfterInvoicesReceived = true;
      getAllDocumentsInCollectionInTimespanWasSuccessful = true;
      
      documentsInCollection = [{id: 43, timestamp:1234, items: [{name:'pot', price: 2}]}];
      
      expecting(function() {
         expect(capturedInvoices.length).to.be.eql(1);
         expect(capturedInvoices[0]).to.be.eql([{id: 43, timestamp:1234, items: [{name:'pot', price: 2}]}]);
      }, done);

      whenThePublication(cash.server.topics.CASH_COLLECTION_NAME).withData('CollectionB').getsSent();
   });
   
   it('the invoices get published when a new invoice was added', function(done) {
      getAllDocumentsInCollectionInTimespanWasSuccessful = true;
      
      documentsInCollection = [{id: 4, timestamp: 6766, items: [{name:'plant', price: 22}]}];
      
      expecting(function() {
         expect(capturedInvoices.length).to.be.eql(2);
      }, done);

      givenThePublication(cash.server.topics.CASH_COLLECTION_NAME).withData('donaldsInvoices').getsSent();
      whenTheCommand(cash.server.topics.NEW_INVOICE_ADDED_COMMAND).withData({}).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('the published invoices are sorted descending by their timestimes', function(done) {
      getAllDocumentsInCollectionInTimespanWasSuccessful = true;
      
      documentsInCollection = [     {id:  4, timestamp: 3333, items: [{name:'plant', price: 22}]},
                                    {id:  3, timestamp:  221, items: [{name:'pot', price: 10}]},
                                    {id: 12, timestamp: 1107, items: [{name:'in vitro flask', price: 10}]}];
      
      var expectedPublishedData = [ {id:  4, timestamp: 3333, items: [{name:'plant', price: 22}]},
                                    {id: 12, timestamp: 1107, items: [{name:'in vitro flask', price: 10}]},
                                    {id:  3, timestamp:  221, items: [{name:'pot', price: 10}]}];
      
      expecting(function() {
         expect(capturedInvoices.length).to.be.eql(2);
         expect(capturedInvoices[1]).to.be.eql(expectedPublishedData);
      }, done);

      givenTheExpectedNumberOfPublicationsIs(2);
      givenThePublication(cash.server.topics.CASH_COLLECTION_NAME).withData('donaldsInvoices').getsSent();
      whenTheCommand(cash.server.topics.NEW_INVOICE_ADDED_COMMAND).withData({}).getsSent();
   });
   
   it('the published invoices were all created today', function(done) {
      var aDayInMillis = 24 * 60 * 60 * 1000;
      
      getAllDocumentsInCollectionInTimespanWasSuccessful = true;
      
      documentsInCollection = [{id: 4, timestamp: aDayInMillis, items: [{name:'plant', price: 22}]}];
      
      expecting(function() {
         expect(capturedRequests.length).to.be.eql(2);
         expect(capturedRequests[1].collectionName).to.be.eql('daisysInvoices');
         expect(capturedRequests[1].minimumTimestamp).to.be.eql(aDayInMillis);
         expect(capturedRequests[1].maximumTimestamp).to.be.eql(2 * aDayInMillis - 1);
      }, done);

      timeInMillis = aDayInMillis + 500;
      givenTheExpectedNumberOfPublicationsIs(2);
      givenThePublication(cash.server.topics.CASH_COLLECTION_NAME).withData('daisysInvoices').getsSent();
      whenTheCommand(cash.server.topics.NEW_INVOICE_ADDED_COMMAND).withData({}).getsSent();
   });
});  