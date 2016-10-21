/* global assertNamespace, cash */

require('./Database.js');
require('../../NamespaceUtils.js');

var Promise = require('promise');

var TingoDatabase = require('tingodb')().Db;

assertNamespace('cash.server.database');

cash.server.database.TingoDbDatabase = function TingoDbDatabase(databaseFolder) {
   
   var database = new TingoDatabase(databaseFolder, {});
   
   var getCollection = function getCollection(collectionName) {
      return new Promise(function(fulfill, reject) {
         fulfill(database.collection(collectionName));
      });
   };
   
   var insertDocument = function insertDocument(document) {
      return function(collection) {
         return new Promise(function(fulfill, reject) {
            collection.insert(document, function(err, result) {
               if (err) {
                  reject(err);
               } else {
                  fulfill(result);
               }
            });
         });
      };
   };
   
   var removeDocument = function removeDocument(documentId) {
      return function(collection) {
         return new Promise(function(fulfill, reject) {
            collection.remove({_id: documentId}, function(err, result) {
               if (err) {
                  reject(err);
               } else {
                  fulfill(result);
               }
            });
         });
      };
   };
   
   var findAll = function findAll(collection) {
      var cursor = collection.find();

      return new Promise(function(fulfill, reject) {
         cursor.toArray(function(err, data) {
            if (err) {
               reject(err);
            } else {
               fulfill(data.map(function(document) {
                  return {id: document._id, name: document.name, price: document.price};
               }));
            }
         }); 
      });
   };
   
   this.insert = function insert(collectionName, document) {
      return getCollection(collectionName).then(insertDocument(document));
   };
   
   this.remove = function remove(collectionName, documentId) {
      return getCollection(collectionName).then(removeDocument(documentId));
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName) {
      return getCollection(collectionName).then(findAll);  
   };
};

cash.server.database.TingoDbDatabase.prototype = new cash.server.database.Database();