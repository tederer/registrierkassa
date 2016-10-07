/* global common, assertNamespace, cash */

require('../../../NamespaceUtils.js');

assertNamespace('cash.server.database');


/**
 * An implementation of a database (e.g. for MongoDB) should implement the functions
 * defined in this interface.
 */

/**
 * constructor for a BusBridge.
 */
cash.server.database.Database = function Database() {
   
   this.insert = function insert(collection, data) {};
   
   this.remove = function remove(collection, data) {};
   
};
 