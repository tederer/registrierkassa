/* global global, common, cash, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/common/infrastructure/bus/Bus.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/server/Cash.js');
require('timers');

var Promise = require('promise');

var bus;
var database;
var cashInstance;
var insertationWasSuccessful;
var doneAfterInsert;
var doneFunction;
var doneAfterAcknowledgmentReceived;
var doneAfterRejectReceived;
var capturedInsertation;
var capturedAcknowledgments;
var capturedRejections;

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
   
   this.update = function update(collectionName, documentId, document) {
      return new Promise(function(fulfill, reject) {
         reject('getAllDocumentsInCollection not implemented in TestingDatabase');
      });
   };
   
   this.remove = function remove(collectionName, documentId) {
      return new Promise(function(fulfill, reject) {
         reject('getAllDocumentsInCollection not implemented in TestingDatabase');
      });
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName) {
      return new Promise(function(fulfill, reject) {
         reject('getAllDocumentsInCollection not implemented in TestingDatabase');
      });
   };
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

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
   insertationWasSuccessful = undefined;
   capturedInsertation = undefined;
   capturedAcknowledgments = [];
   capturedRejections = [];
   doneAfterInsert = false;
   doneAfterAcknowledgmentReceived = false;
   doneAfterRejectReceived = false;
   doneFunction = function() {};
   
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();
   cashInstance = new cash.server.Cash(bus, database, true);
   
   bus.subscribeToCommand(cash.topics.ACKNOWLEDGE_INVOICE_COMMAND, function(data) {
      capturedAcknowledgments[capturedAcknowledgments.length] = data;
      if (doneAfterAcknowledgmentReceived) {
         doneFunction();
      }
   });

   bus.subscribeToCommand(cash.topics.REJECT_INVOICE_COMMAND, function(data) {
      capturedRejections[capturedRejections.length] = data;
      if (doneAfterRejectReceived) {
         doneFunction();
      }
   });
};


describe('Cash', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a cash is an instance/object', function() {
      expect(valueIsAnObject(cashInstance)).to.be.eql(true);
   });
   
   it('a new invoice gets inserted into the cash collection on a CREATE_INVOICE_COMMAND', function(done) {
      insertationWasSuccessful = true;
      doneAfterInsert = true;
      
      var data = {id: 1, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertation.collectionName).to.be.eql('cash');
         expect(capturedInsertation.document).to.be.eql([{name:'pot', price: 2}]);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
   });   
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND does not contain an id', function(done) {
      
      var data = {items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND does not contain items', function(done) {
      
      var data = {id: 556};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contain items that is undefined', function(done) {
      
      var data = {id: 556, items: undefined};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an empty id', function(done) {
      
      var data = {id: '', items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an empty name', function(done) {
      
      var data = {id: 1, items: [{name:'pot', price: 2}, {name:'', price: 10}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an undefined name', function(done) {
      
      var data = {id: 1, items: [{name:'pot', price: 2}, {name:undefined, price: 10}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an empty price', function(done) {
      
      var data = {id: 1, items: [{name:'pot', price: ''}, {name:'dog', price: 10}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an undefined price', function(done) {
      
      var data = {id: 1, items: [{name:'pot', price: 22}, {name:'dog', price: undefined}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with a not parsable price', function(done) {
      
      var data = {id: 1, items: [{name:'pot', price: 22}, {name:'dog', price: 'cheep'}]};
      
      expecting(function() {
         expect(capturedInsertation).to.be.eql(undefined);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a valid invoice gets acknowledged with an ACKNOWLEDGE_INVOICE_COMMAND', function(done) {
      insertationWasSuccessful = true;
      doneAfterAcknowledgmentReceived = true;
      
      var data = {id: 1234, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedAcknowledgments.length).to.be.eql(1);
         expect(capturedAcknowledgments[0].id).to.be.eql(1234);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
   });   
   
   it('an invalid invoice gets rejected with an REJECT_INVOICE_COMMAND', function(done) {
      insertationWasSuccessful = true;
      doneAfterRejectReceived = true;
      
      var data = {id: 43};
      
      expecting(function() {
         expect(capturedRejections.length).to.be.eql(1);
         expect(capturedRejections[0].id).to.be.eql(43);
         expect(capturedRejections[0].error).to.be.eql('no items are available');
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(data).getsSent();
   });   
});  