/* global cash, assertNamespace */

require('./NamespaceUtils.js');

assertNamespace('cash.topics');

//                PUBLICATIONS

/**
 * The server publishes on this topic an array of all configured products. 
 * Each product is an object containing the values (keys):
 *
 * - id     : number    a unique number
 * - name   : string    the name describing the product
 * - price  : number    the price of this product
 *
 * example of such a product: {"id":1,"name":"in vitro flask","price":10}

 */
cash.topics.PRODUCTRANGE = '/productrange';


/**
 * The server publishes on this topic an array of all invoices created today. 
 * The data is an object containing the values (keys):
 *
 * - id        : number    a unique identifier
 * - timestamp : number    the number of milliseconds since epoch
 * - items     : array     an array of items in the invoice
 *
 * example data: { "id": "13", "timestamp": 1478258179434, "items": [{name: 'fertilizer 4-5-6', price: 5}, {name: 'in vitro plant', price: 10}]}
 */
cash.topics.TODAYS_INVOICES = '/cash/todaysInvoices';


//                COMMANDS

/**
 * A client send this command to inform the server that the user wants to
 * create a new product. 
 * The data of this command is an object containing the values (keys):
 *
 * - name      : string    the name describing the product
 * - price     : number    the price of this product
 *
 * example data: { name: 'fertilizer 4-5-6', price: 5}
 */ 
cash.topics.CREATE_PRODUCT_COMMAND = '/productrange/createProductCommand';

/**
 * A client send this command to inform the server that the user wants to
 * update an existing product. 
 * The data of this command is an object containing the values (keys):
 *
 * - id        : number    the unique identifier of the product to update
 * - name      : string    the name describing the product
 * - price     : number    the price of this product
 *
 * example data: { "id":1, name: 'fertilizer 4-5-6', price: 5}
 */ 
cash.topics.UPDATE_PRODUCT_COMMAND = '/productrange/updateProductCommand';

/**
 * A client send this command to inform the server that the user wants to
 * delete an existing product. 
 * The data of this command is an object containing the values (keys):
 *
 * - id     : number    a unique identifier
 *
 * example of such a product: {"id": "1e33"}
 */ 
cash.topics.DELETE_PRODUCT_COMMAND = '/productrange/deleteProductCommand';

/**
 * A client send this command to inform the server that the user wants to
 * create a new invoice. 
 * The data of this command is an object containing the values (keys):
 *
 * - id        : number    a unique identifier
 * - items     : array     an array of items in the invoice
 *
 * example data: { "id": "13", "items": [{name: 'fertilizer 4-5-6', price: 5}, {name: 'in vitro plant', price: 10}]}
 */ 
cash.topics.CREATE_INVOICE_COMMAND = '/cash/createInvoiceCommand';

/**
 * The server sends this command to inform the client that the invoice was
 * sccessfully added.
 * The data of this command is an object containing the values (keys):
 *
 * - id        : number    the unique identifier of the added invoice
 *
 * example data: { "id": "13"}
 */ 
cash.topics.ACKNOWLEDGE_INVOICE_COMMAND = '/cash/acknowledgeInvoiceCommand';

/**
 * The server sends this command to inform the client that the invoice was
 * not added.
 * The data of this command is an object containing the values (keys):
 *
 * - id        : number    the unique identifier of the invoice
 * - error     : string    error message
 * example data: { "id": "13", "error": "invalid item"}
 */ 
cash.topics.REJECT_INVOICE_COMMAND = '/cash/rejectInvoiceCommand';
