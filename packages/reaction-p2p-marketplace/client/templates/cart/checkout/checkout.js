Template.cartCheckoutMarketplace.replaces("cartCheckout");


/* Override "click #btn-checkout" event in 'cartPanel' and 'openCartDrawer' templates */

const overrideEventHandler = (template, event, newHandler) => {
  Template[template].__eventMaps.map( map => delete map[event] );
  Template[template].events({ [event]: newHandler });
}

const proceedToCheckout = () => {
  // allow only logged in users to do that
  if (!Blaze._globalHelpers.isLoggedIn(true)) return;

  $("#cart-drawer-container").fadeOut();
  Session.set("displayCart", false);
  return ReactionRouter.go("cart/checkout");
}

Meteor.startup(() => {
  overrideEventHandler("cartPanel", "click #btn-checkout", proceedToCheckout);
  overrideEventHandler("openCartDrawer", "click #btn-checkout", proceedToCheckout);
});
