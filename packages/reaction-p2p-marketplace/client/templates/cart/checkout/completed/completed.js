Template.cartCompletedMarketplace.replaces("cartCompleted");

/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */
Template.cartCompleted.helpers({
  transactionId: function () {
    return this.billing[0].paymentMethod.transactionId;
  },
});

/**
 * cartCompleted onCreated
 *
 * subscribe to products in order to access the products in subtemplates (ordersListItemsMarketplace / items.js)
 */
Template.cartCompleted.onCreated(function () {
    ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory = Meteor.subscribe("ProductsForOrdersHistory", function () {
    });
});

Template.cartCompleted.onDestroyed(function() {
  // stop that subscription, because we want it only on this page, not on any other
  if (ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory != null) {
    ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory.stop();
  }
});
