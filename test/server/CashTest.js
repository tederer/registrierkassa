/* global global, common, cash, Map, setTimeout */

require(global.PROJECT_SOURCE_ROOT_PATH + '/SharedTopics.js');
require(global.PROJECT_SOURCE_ROOT_PATH + '/server/ServerTopics.js');
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
var doneAfterNewInvoiceAddedCommandReceived;
var capturedInsertations;
var capturedAcknowledgments;
var capturedRejections;
var capturedCollectionNames;
var timeInMillis;
var newInvoiceAddedCommandInvocations;

var TestingDatabase = function TestingDatabase() {
   
   this.insert = function insert(collectionName, document) {
      capturedInsertations[capturedInsertations.length] = {collectionName: collectionName, document: document};
      
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
   
      
   this.getAllDocumentsInCollectionInTimespan = function getAllDocumentsInCollectionInTimespan(collectionName, minimumTimestamp, maximumTimestamp) {
      return new Promise(function(fulfill, reject) {
         reject('getAllDocumentsInCollectionInTimespan not implemented in TestingDatabase');
      });
   };
};

function valueIsAnObject(val) {
   if (val === null) { return false;}
   return ( (typeof val === 'function') || (typeof val === 'object') );
}

var getWithData = function getWithData(commandTopic) {
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

var givenTheCommand = function givenTheCommand(commandTopic) {
   return getWithData(commandTopic);
};

var givenMillisPass = function givenMillisPass(millis) {
      timeInMillis += millis;
};

var whenTheCommand = function whenTheCommand(commandTopic) {
   return getWithData(commandTopic);
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
   capturedInsertations = [];
   capturedAcknowledgments = [];
   capturedRejections = [];
   capturedCollectionNames = [];
   doneAfterInsert = false;
   doneAfterAcknowledgmentReceived = false;
   doneAfterRejectReceived = false;
   doneAfterNewInvoiceAddedCommandReceived = false;
   doneFunction = function() {};
   timeInMillis = 0;
   newInvoiceAddedCommandInvocations = 0;
   
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();

   bus.subscribeToPublication(cash.server.topics.CASH_COLLECTION_NAME, function(data) {
      capturedCollectionNames[capturedCollectionNames.length] = data;
   });

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
   
   bus.subscribeToCommand(cash.server.topics.NEW_INVOICE_ADDED_COMMAND, function(data) {
      newInvoiceAddedCommandInvocations++;
      if (doneAfterNewInvoiceAddedCommandReceived) {
         doneFunction();
      }
   });
   
   var optionals = { loggingDisabled: true, timeFunction: function() { return timeInMillis;}};
   cashInstance = new cash.server.Cash(bus, database, optionals);
};


describe('Cash', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a cash is an instance/object', function() {
      expect(valueIsAnObject(cashInstance)).to.be.eql(true);
   });
   
   it('a new invoice gets inserted into the cash collection on a CREATE_INVOICE_COMMAND (A)', function(done) {
      insertationWasSuccessful = true;
      doneAfterInsert = true;
      
      var invoice1 = {id: 1, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(1);
         expect(capturedInsertations[0].collectionName).to.be.eql('cash');
         expect(capturedInsertations[0].document.timestamp).to.be.eql(0);
         expect(capturedInsertations[0].document.items).to.be.eql([{name:'pot', price: 2}]);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
   });   
      
   it('a new invoice gets inserted into the cash collection on a CREATE_INVOICE_COMMAND (B)', function(done) {
      insertationWasSuccessful = true;
      doneAfterInsert = true;
      
      var invoice1 = {id: 342, items: [{name:'in vitro flask', price: 12}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(1);
         expect(capturedInsertations[0].collectionName).to.be.eql('cash');
         expect(capturedInsertations[0].document.timestamp).to.be.eql(1200);
         expect(capturedInsertations[0].document.items).to.be.eql([{name:'in vitro flask', price: 12}]);
      }, done);

      givenMillisPass(1200);
      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
   });   
      
   it('a new invoice pulbishes then name of the database collection', function(done) {
      
      expecting(function() {
         expect(capturedCollectionNames.length).to.be.eql(1);
         expect(capturedCollectionNames[0]).to.be.eql('cash');
      }, done);
      
      setTimeout(doneFunction, 10);
   });   
      
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND does not contain an id', function(done) {
      
      var invoice1 = {items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND does not contain items', function(done) {
      
      var invoice1 = {id: 556};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contain items that is undefined', function(done) {
      
      var invoice1 = {id: 556, items: undefined};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an empty id', function(done) {
      
      var invoice1 = {id: '', items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an empty name', function(done) {
      
      var invoice1 = {id: 1, items: [{name:'pot', price: 2}, {name:'', price: 10}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an undefined name', function(done) {
      
      var invoice1 = {id: 1, items: [{name:'pot', price: 2}, {name:undefined, price: 10}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an empty price', function(done) {
      
      var invoice1 = {id: 1, items: [{name:'pot', price: ''}, {name:'dog', price: 10}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with an undefined price', function(done) {
      
      var invoice1 = {id: 1, items: [{name:'pot', price: 22}, {name:'dog', price: undefined}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('no invoice gets inserted when the CREATE_INVOICE_COMMAND contains an item with a not parsable price', function(done) {
      
      var invoice1 = {id: 1, items: [{name:'pot', price: 22}, {name:'dog', price: 'cheep'}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(0);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('a valid invoice gets acknowledged with an ACKNOWLEDGE_INVOICE_COMMAND', function(done) {
      insertationWasSuccessful = true;
      doneAfterAcknowledgmentReceived = true;
      
      var invoice1 = {id: 1234, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedAcknowledgments.length).to.be.eql(1);
         expect(capturedAcknowledgments[0].id).to.be.eql(1234);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
   });   
   
   it('an invalid invoice gets rejected with an REJECT_INVOICE_COMMAND', function(done) {
      insertationWasSuccessful = true;
      doneAfterRejectReceived = true;
      
      var invoice1 = {id: 43};
      
      expecting(function() {
         expect(capturedRejections.length).to.be.eql(1);
         expect(capturedRejections[0].id).to.be.eql(43);
         expect(capturedRejections[0].error).to.be.eql('no items are available');
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
   });   
   
   it('a repeatedly send valid invoice does not get inserted into the cash collection', function(done) {
      insertationWasSuccessful = true;
      
      var invoice1 = {id: 43, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(1);
      }, done);

      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   });   
   
   it('two valid invoices with different IDs get inserted into the cash collection', function(done) {
      insertationWasSuccessful = true;
      
      var invoice1 = {id: 43, items: [{name:'pot', price: 2}]};
      var invoice2 = {id: 44, items: [{name:'bag', price: 1}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(2);
      }, done);

      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice2).getsSent();
      
      setTimeout(doneFunction, 10);
   });   
   
   it('a valid invoice sent again after an hour gets inserted into the cash collection', function(done) {
      insertationWasSuccessful = true;
      
      var invoice = {id: 43, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(2);
      }, done);

      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice).getsSent();
      givenMillisPass(60 * 60 * 1000);
      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice).getsSent();
      
      setTimeout(doneFunction, 10);
   });   
   
   it('only expired IDs get removed', function(done) {
      insertationWasSuccessful = true;
      
      var invoice1 = {id: 11, items: [{name:'pot', price: 2}]};
      var invoice2 = {id: 22, items: [{name:'plant', price: 12}]};
      
      expecting(function() {
         expect(capturedInsertations.length).to.be.eql(3);
      }, done);

      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      givenMillisPass(30 * 60 * 1000);
      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice2).getsSent();
      givenMillisPass(30 * 60 * 1000);
      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice2).getsSent();
      
      setTimeout(doneFunction, 10);
   });
   
   it('after inserting a new invoice a NEW_INVOICE_ADDED_COMMAND gets sent', function(done) {
      insertationWasSuccessful = true;
      doneAfterNewInvoiceAddedCommandReceived = true;
      
      var invoice1 = {id: 1, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(newInvoiceAddedCommandInvocations).to.be.eql(1);
      }, done);

      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
   });

   it('a repeatedly send valid invoice triggers Cash to send only one NEW_INVOICE_ADDED_COMMAND.', function(done) {
      insertationWasSuccessful = true;
      
      var invoice1 = {id: 43, items: [{name:'pot', price: 2}]};
      
      expecting(function() {
         expect(newInvoiceAddedCommandInvocations).to.be.eql(1);
      }, done);

      givenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      whenTheCommand(cash.topics.CREATE_INVOICE_COMMAND).withData(invoice1).getsSent();
      
      setTimeout(doneFunction, 10);
   }); 
});  