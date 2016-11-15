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
   
   var updateDocument = function updateDocument(documentId, document) {
      return function(collection) {
         return new Promise(function(fulfill, reject) {
            collection.update({_id: documentId}, document, function(err, result) {
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
                  var result = {};
                  Object.keys(document).filter(function(key) { return !key.startsWith('_');}).forEach(function(key) {
                     result[key] = document[key];
                  });
                  result.id = document._id;
                  return result;
               }));
            }
         }); 
      });
   };
   
   this.insert = function insert(collectionName, document) {
      return getCollection(collectionName).then(insertDocument(document));
   };
   
   this.update = function update(collectionName, documentId, document) {
      return getCollection(collectionName).then(updateDocument(documentId, document));
   };
   
   this.remove = function remove(collectionName, documentId) {
      return getCollection(collectionName).then(removeDocument(documentId));
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName) {
      return getCollection(collectionName).then(findAll);  
   };
   
   this.getAllDocumentsInCollectionInTimespan = function getAllDocumentsInCollectionInTimespan(collectionName, minimumTimestamp, maximumTimestamp) {
      return getCollection(collectionName).then(findAll); 
   };
};

cash.server.database.TingoDbDatabase.prototype = new cash.server.database.Database();