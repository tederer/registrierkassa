/* global cash, assertNamespace */

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
cash.topics.PRODUCTS = '/products';


//                COMMANDS

/**
 * A client send this command to inform the server that the user wants to
 * create a new product. 
 * The data of this command is an object containg the values (keys):
 *
 * - name      : string    the name describing the product
 * - price     : number    the price of this product
 *
 * example data: { name: 'fertilizer 4-5-6', price: 5}
 */ 
cash.topics.CREATE_NEW_PRODUCT_COMMAND = '/products/createNewProductCommand';
