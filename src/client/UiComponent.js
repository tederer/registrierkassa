/* global cash, assertNamespace, io */

assertNamespace('cash.ui');

/**
 * constructor for a UiComponent.
 */
cash.ui.UiComponent = function UiComponent() {
   
   /**
    * Gets called by the UI after the component was created.
    * Concrete UiComponents should override this function to do their initialization work there.
    */
   this.initialize = function initialize () {};
};