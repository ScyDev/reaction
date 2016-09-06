/* Call after the original method, but before the after hooks */
ReactionCore.MethodHooks.firstAfter("cart/submitPayment", function (options) {
  ReactionCore.Log.debug("AFTER(1st) cart/submitPayment", options);
  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  const { result = {} } = options
  const cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId() });

  if (typeof options.error === "undefined" || !cart) return result

  if (!cart.billing) ReactionCore.Log.info(
    'AFTER(1st) cart/submitPayment: No billing address after payment! Meteor.userId():',
    Meteor.userId(), 'options:', options
  );

  if (cart.items && cart.billing && cart.billing[0].paymentMethod) {
    const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
    // Return orderId as result from this after hook call.
    // This is done by extending the existing result.
    result.orderId = orderId;
  } else { throw new Meteor.Error(
      "An error occurred verifing payment method. Failed to save order. Meteor.userId():", Meteor.userId(), "options:", options
    );
  }

  return result;
});


