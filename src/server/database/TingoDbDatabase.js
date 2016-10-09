/* global assertNamespace, cash */

require('./NamespaceUtils.js');

var TingoDatabase = require('tingodb')().Db;

assertNamespace('cash.server.database');

cash.server.database.TingoDbDatabase = function TingoDbDatabase(databaseFolder) {
   
   var database = new TingoDatabase(databaseFolder, {});
   
   this.insert = function insert(collectionName, document) {
      var collection = database.collection(collectionName);
      collection.insert(document);
   };
   
   this.remove = function remove(collectionName, documentId) {
      var collection = database.collection(collectionName);
      collection.remove({id:documentId});      
   };
   
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName, callback) {
      var collection = database.collection(collectionName);
      var cursor = collection.find();
      cursor.toArray(function(err, data) {
         if (!err) {
            callback(err, data.map(function(document) {
               return {id: document._id, name: document.name, price: document.price};
            }));
         } else {
            callback(err, data);
         }
      });    
   };
};

cash.server.database.TingoDbDatabase.prototype = new cash.server.database.Database();