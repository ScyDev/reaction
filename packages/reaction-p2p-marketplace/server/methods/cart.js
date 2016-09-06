const { Log } = ReactionCore;

Meteor.methods({
  "cart/checkInventoryQuantity": function (cartId) {
    check(cartId, String);

    let cart = ReactionCore.Collections.Cart.findOne({_id: cartId});
    // Log.info("Meteor.methods(cart/checkInventoryQuantity) cart:", cart, "\n\nshipping address", cart.shipping, "\n\nbilling address", cart.billing);

    for (let item of cart.items) {
      let product = ReactionCore.Collections.Products.findOne({_id: item.productId});
      // Log.info("Meteor.methods(cart/checkInventoryQuantity) product for id", item.productId, ":", product);

      if (parseInt(item.quantity) > parseInt(product.copiedInventoryQuantity)) {
        Log.warn(`Meteor.methods(cart/checkInventoryQuantity) cart/addToCart: Not enough items in stock`);
        throw new Meteor.Error(403, "Not enough items in stock");
      }
    }

    return true;
  }
});


/* Check if there are enough items in stock before adding an item in cart */
ReactionCore.MethodHooks.before("cart/addToCart", function(options) {
  const [ productId, variantId, itemQty ] = options.arguments;

  const product = ReactionCore.Collections.Products.findOne(productId);
  const variant = ReactionCore.Collections.Products.findOne(variantId);
  if (!product || !variant) return;

  /* WARNING: This message could not be changed as on the client side it is expected to be exactly the same */
  const errorMessage = "Not enough items in stock";

  let quantity = itemQty;
  const MIN = variant.minOrderQuantity || 1;
  const MAX = variant.inventoryQuantity || Infinity;

  if (MIN > MAX) {
    Log.warn(`BEFORE cart/addToCart: productId ${product._id}, variantId ${variant._id}. InventoryQuantity lower then minimum order`);
    throw new Meteor.Error(403, errorMessage);
  }

  if (quantity < MIN) quantity = MIN;
  if (quantity > MAX) quantity = MAX;

  const cart = ReactionCore.Collections.Cart.findOne({ userId: this.userId });
  if (!cart) return;

  const itemInCart = cart.items ? cart.items.find(item => item.productId == productId) : null;
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
  Log.info(`BEFORE cart/addToCart: ${variant.inventoryQuantity} items in inventory, ${quantityInCart} items in cart, trying to add ${quantity} items`);

  if (quantity + quantityInCart > variant.inventoryQuantity) {
    Log.warn(`BEFORE cart/addToCart: productId ${product._id}, variantId ${variant._id}. Not enough items in stock`);
    throw new Meteor.Error(403, errorMessage);
  }
});


/* Allow only logged in user to do add items to cart */
ReactionCore.MethodHooks.before("cart/addToCart", function(options) {
  const shopId = ReactionCore.getShopId();
  const user = Accounts.user();
  const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);

  ReactionCore.Log.info(`BEFORE cart/addToCart: shopId ${shopId}, user ${user._id}, isAnonymous ${isAnonymous}`);

  if (isAnonymous) {
    const message = "Not logged in. Anonymous users cannot add items to cart.";
    Log.warn(message);
    throw new Meteor.Error(403, message);
  }
});


/* Add sellerId to the order object */
ReactionCore.MethodHooks.after("cart/addToCart", function(options) {
  const result = options.result;

  const [ productId, variantId, itemQty ] = options.arguments;
  const cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId() });
  if (!cart) return result;

  const product = ReactionCore.Collections.Products.findOne(productId);
  ReactionCore.Collections.Cart.update(
    { _id: cart._id, "items.productId": productId, "items.variants._id": variantId },
    { $set: { "items.$.sellerId": product.userId } }
  );

  ReactionCore.Log.info("AFTER cart/addToCart: cart:", cart._id, "updated");

  return result;
});


/* Decrease the number of items in the stock when the order process in finished */
ReactionCore.MethodHooks.after("cart/copyCartToOrder", function(options) {
  const [ cartId ] = options.arguments;
  const result = options.result;

  const order = ReactionCore.Collections.Orders.findOne({ cartId });
  if (!order) return result;

  Log.info("AFTER cart/copyCartToOrder: calling orders/inventoryAdjust, order", order._id);
  Meteor.defer(() => Meteor.call("orders/inventoryAdjust", order._id));

  /* Be sure that the cart is already deleted from within the original method */
  const cart = ReactionCore.Collections.Cart.findOne(cartId);
  if (cart && cart.items && cart.items.length) Log.info("AFTER cart/copyCartToOrder: cart is not empty", cart.items.length);
  else Log.info("AFTER cart/copyCartToOrder: cart", cartId, "already deleted");

  // ReactionCore.Log.info("AFTER cart/copyCartToOrder: removing cart by userId");
  // ReactionCore.Collections.Cart.remove({ userId: order.userId });

  return result;
});


Meteor.methods({
  "cart/deleteCart": function (cartId, sessionId) {
    check(cartId, String);
    check(sessionId, String);

    ReactionCore.Log.info("cart/deleteCart:", cartId);
    ReactionCore.Collections.Cart.remove(cartId);

    let userId = Meteor.userId();
    Meteor.call("cart/createCart", userId, sessionId);
  }
});


Meteor.methods({
  "cart/deleteCartAdresses": function (cartId, sessionId) {
    check(cartId, String);
    check(sessionId, String);

    ReactionCore.Log.info("cart/deleteCartAdresses:", cartId);
    ReactionCore.Collections.Cart.update(cartId, { $set: {
      billing: [],
      shipping: []
    }});
  },
});


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


