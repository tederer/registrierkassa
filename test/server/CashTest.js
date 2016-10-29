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
var capturedInsertation;

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

/*
expecting(function() {
   expect(capturedPublishedProducts).to.be.eql([productA, productB]);
}, done);
*/    

var setup = function setup() {
   insertationWasSuccessful = undefined;
   capturedInsertation = undefined;
   doneAfterInsert = false;
   doneFunction = function() {};
   
   bus = new common.infrastructure.bus.Bus();
   database = new TestingDatabase();
   cashInstance = new cash.server.Cash(bus, database);
};


describe('Cash', function() {
	
   beforeEach(setup);
   
   it('creating an instance of a cash is an instance/object', function() {
      expect(valueIsAnObject(cashInstance)).to.be.eql(true);
   });
});  