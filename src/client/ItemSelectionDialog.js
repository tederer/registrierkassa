/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a ItemSelectionDialog that is invisible after its creation.
 */
cash.ui.ItemSelectionDialog = function ItemSelectionDialog(containerId, bus) {
      var contentContainerId = containerId + ' > #content';
      var table;
            
      var setVisible = function setVisible(visible) {
         if(visible) {
            table.rows({selected:true}).deselect();
         }
         $(containerId).css('visibility', visible ? 'visible' : 'hidden');
      };
      
      var initializeTable = function initializeTable() {
         table = $(contentContainerId + ' #table').DataTable({
            data: [],
            columns: [
               { data: 'name' },
               { data: 'price',
                 render: function( data, type, full, meta ) {
                  return data.toFixed(2) + ' €';
                 },
                 className: 'dt-body-right'
               }
            ],
            paging: false,
            searching: false,
            bInfo: false,
            bSort: false,
            select: {
               style: 'multi'
            }
         } );
      };
      
      var onOkClicked = function onOkClicked() {
         var tableData = table.rows({selected:true}).data();
         
         if (tableData.length > 0) {
            var commandData = [];
            
            for (var index=0; index < tableData.length; index++) {
               commandData[commandData.length] = {'name': tableData[index].name, 'price': tableData[index].price};
            }
            
            bus.sendCommand(cash.client.topics.ADD_ITEMS_TO_INVOICE_COMMAND, commandData);
         }
         
         setVisible(false);
      };
      
      var onCancelClicked = function onCancelClicked() {
         setVisible(false);
      };
      
      var onProductsReceived = function onProductsReceived(products) {
         table.clear();
         products.forEach(function(product) {
            table.row.add(product);
         });
         table.draw();
      };
      
      var initializeContainerContent = function initializeContainerContent() {
         var containerContent = '<div id="content"><div id="body"></div><div id="footer"></div></div>';
         var tableHtml        = '<table id="table" width="90%" class="stripe hover cell-border"><thead><tr><th>Name</th><th>Preis</th></tr></thead></table>';
         var okButton         = '<button type="button" id="okButton">OK</button>';
         var cancelButton     = '<button type="button" id="cancelButton">Abbrechen</button>';

         $(containerId).html(containerContent);
         $(contentContainerId + ' > #body').html(tableHtml);
         $(contentContainerId + ' > #footer').html(okButton + cancelButton);
         
         $(contentContainerId + ' > #footer > #okButton').on('click', onOkClicked);
         $(contentContainerId + ' > #footer > #cancelButton').on('click', onCancelClicked);
      };
      
      this.initialize = function initialize() {
         setVisible(false);
         initializeContainerContent();
         initializeTable();
         bus.subscribeToPublication(cash.topics.PRODUCTS, onProductsReceived);
      };
      
      this.show = function show() {
         setVisible(true);
      };
};

cash.ui.ItemSelectionDialog.prototype = new cash.ui.UiComponent();