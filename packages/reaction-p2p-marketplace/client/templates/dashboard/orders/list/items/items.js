Template.ordersListItemsMarketplace.replaces("ordersListItems");

/**
 * ordersListItemsMarketplace helpers
 *
 */

Template.ordersListItems.helpers({
  sellingDate: function(){
    let product =  ReactionCore.Collections.Products.findOne({_id: this.productId});
    if(product != undefined)
      return moment(product.forSaleOnDate).format("DD.MM.YYYY");
    else
      return undefined;
  },
  pickupTimeFrom: function(){
    let product =  ReactionCore.Collections.Products.findOne({_id: this.productId});
    if(product != undefined)
      return product.pickupTimeFrom;
    else
      return undefined;
  },
  pickupTimeTo: function(){
    let product =  ReactionCore.Collections.Products.findOne({_id: this.productId});
    if(product != undefined)
      return product.pickupTimeTo;
    else
      return undefined;
  },
});
