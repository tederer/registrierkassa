/* global cash, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('cash.server.topics');

//                PUBLICATIONS
/**
 * The client publishes on this topic an array of all items in the invoice. 
 * Each product is an object containing the values (keys):
 *
 * - name      : string    the name describing the product
 * - price     : number    the price of this product
 *
 * example of such a product: {"name":"in vitro flask","price":10}

 */
cash.server.topics.CASH_COLLECTION_NAME = '/server/cashCollectionName';