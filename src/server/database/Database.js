/* global assertNamespace, cash */

require('../../NamespaceUtils.js');

assertNamespace('cash.server.database');


/**
 * An implementation of a database (e.g. for MongoDB) should implement the functions
 * defined in this interface.
 */
cash.server.database.Database = function Database() {
   
   // inserts a document into the collection specified collection
   this.insert = function insert(collectionName, document, callback) {};
   
   // removes a document with the id in the specified collection
   this.remove = function remove(collectionName, documentId, callback) {};
   
   // provides an array of all documents in the specified collection
   this.getAllDocumentsInCollection = function getAllDocumentsInCollection(collectionName, callback) {};
};
 