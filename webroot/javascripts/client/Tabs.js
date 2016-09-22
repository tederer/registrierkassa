var showTab = function showTab(tabId) {
   var showInvoice = tabId === 'invoice';
   var showAdministration = tabId === 'administration';
      
   if (showInvoice || showAdministration) {
      var style = function style(active) {
         return active ? {backgroundColor: '#DDDDDD', visibility: 'visible'} : {backgroundColor: '#AAAAAA', visibility: 'hidden'}; 
      };
      
      var invoiceStyle = style(showInvoice);
      var administrationStyle = style(showAdministration);
      
      $('#cash #tabs #invoice').css('background-color', invoiceStyle.backgroundColor);
      $('#cash #tabs #administration').css('background-color', administrationStyle.backgroundColor);
      $('#cash #content #invoice').css('visibility', invoiceStyle.visibility);
      $('#cash #content #administration').css('visibility', administrationStyle.visibility);
   }
};
   
   