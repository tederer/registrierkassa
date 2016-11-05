/* global cash, assertNamespace */

require('../NamespaceUtils.js');

assertNamespace('cash.server.topics');

//                COMMANDS
/**
 * Informs listeners that a new invoice was added. This command does not
 * contain any data.
 */
cash.server.topics.NEW_INVOICE_ADDED_COMMAND = '/server/invoice/newInvoiceAddedCommand';

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