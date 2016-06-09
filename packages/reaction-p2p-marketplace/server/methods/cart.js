
Meteor.methods({
  "cart/checkInventoryQuantity": function (cartId) {
    check(cartId, String);

    let cart = ReactionCore.Collections.Cart.findOne({_id: cartId});
    ReactionCore.Log.info("Meteor.methods(cart/checkInventoryQuantity) cart: ",cart," \n\nshipping address ",cart.shipping," \n\nbilling address ",cart.billing);

    for (let item of cart.items) {
      ReactionCore.Log.info("Meteor.methods(cart/checkInventoryQuantity) checking cart item: ",item);

      let product = ReactionCore.Collections.Products.findOne({_id: item.productId});
      ReactionCore.Log.info("Meteor.methods(cart/checkInventoryQuantity) product for id ",item.productId,": ",product);

      if (parseInt(item.quantity) > parseInt(product.copiedInventoryQuantity)) {
        ReactionCore.Log.info(`Meteor.methods(cart/checkInventoryQuantity) cart/addToCart: Not enough items in stock`);
        throw new Meteor.Error(403, "Not enough items in stock");
      }
    }

    return true;
  }
});
