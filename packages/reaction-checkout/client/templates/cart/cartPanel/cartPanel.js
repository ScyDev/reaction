/**
 * cartPanel events
 *
 * goes to checkout on btn-checkout click
 *
 */
Template.cartPanel.events({
  "click #btn-checkout": function () {
    // allow only logged in users to do that
    if (!Blaze._globalHelpers.isLoggedIn(true)) {
      return;
    }

    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return ReactionRouter.go("cart/checkout");
  }
});
