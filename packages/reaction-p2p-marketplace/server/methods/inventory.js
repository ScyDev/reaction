/* Decrease the number of items in the stock when the order process in finished */
ReactionCore.MethodHooks.after("inventory/adjust", function (options) {
  const [ product ] = options.arguments;
  const result = options.result;

  // Quantity and variants of this product's variant inventory
  if (product.type === "variant") {
    // copy variant quantity to product for easy display
    ReactionCore.Collections.Products.update({
      _id: product.ancestors[0]
    }, {
      $set: {
        copiedInventoryQuantity: product.inventoryQuantity || 0
      }
    }, { selector: { type: "simple" } });
  }

  return result;
});
