/* global cash, assertNamespace */

assertNamespace('cash.topics');

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

