Template.cartCheckoutMarketplace.replaces("cartCheckout");


/* Override "click #btn-checkout" event in 'cartPanel' and 'openCartDrawer' templates */

const proceedToCheckout = () => {
  // allow only logged in users to do that
  if (!Blaze._globalHelpers.isLoggedIn(true)) return;

  $("#cart-drawer-container").fadeOut();
  Session.set("displayCart", false);
  return ReactionRouter.go("cart/checkout");
}

Meteor.startup(() => {
  Template.overrideEventHandlers("cartPanel", "click #btn-checkout", proceedToCheckout);
  Template.overrideEventHandlers("openCartDrawer", "click #btn-checkout", proceedToCheckout);
});


Template.cartCheckout.onCreated(() => {
  if (ReactionCore.Subscriptions.Cart.ready()) {
    // make all steps available immediately
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");

    // always show cart on checkout
    Session.set("displayCart", true);
  }
});
