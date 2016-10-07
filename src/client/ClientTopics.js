/* global cash, assertNamespace */

assertNamespace('cash.client.topics');

//                COMMANDS
/**
 * Adds items to the invoice. The data of the command is an array of items.
 * Each item is an object containing the values (keys):
 *
 * - name      : string    the name describing the item
 * - price     : number    the price of this product
 *
 * example of such a item: {"name":"in vitro flask","price":10}
 */
cash.client.topics.ADD_ITEMS_TO_INVOICE_COMMAND = '/client/invoice/addItemsCommand';

/**
 * This command gets sent when an invoice item shall get edited.
 * The data of this command is an object containg the values (keys):
 *
 * - rowIndex  : number    the row index in the table that triggered this command
 * - name      : string    the name describing the item
 * - price     : number    the price of this product
 *
 * example data: {rowIndex: 2, name: 'fertilizer', price: 4}
 */
cash.client.topics.EDIT_INVOICE_ITEM_COMMAND = '/client/invoice/editItemCommand';

/**
 * This command gets sent when an item in the invoice needs to be updated.
 * The data of this command is an object containg the values (keys):
 *
 * - rowIndex  : number    the row index in the table that should get updated
 * - name      : string    the name describing the item
 * - price     : number    the price of this product
 *
 * example data: {rowIndex: 2, name: 'fertilizer 4-5-6', price: 5}
 */
cash.client.topics.UPDATE_INVOICE_ITEM_COMMAND = '/client/invoice/updateItemCommand';

/**
 * This command gets sent when the user wants to create a new product.
 * The data of this command is an empty object.
 */
cash.client.topics.SHOW_CREATE_NEW_PRODUCT_COMMAND = '/client/products/showNewProductDialogCommand';

/**
 * This command gets sent when the user wants to add an item(product) to the invoice.
 * The data of this command is an empty object.
 */
cash.client.topics.SHOW_ITEM_SELECTION_DIALOG_COMMAND = '/client/products/showItemSelectionDialogCommand';

/**
 * This command gets sent when the user wants to edit an product.
 * The data of this command is an empty object.
 */
cash.client.topics.SHOW_EDIT_PRODUCTS_DIALOG_COMMAND = '/client/products/showEditProductsDialogCommand';


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
cash.client.topics.INVOICE_ITEMS = '/client/invoice/items';
