const getSellerProductsSelector = (clientSelector, userId) => {
  /* Return records only when current user is shop owner */
  const baseSelector = isShopOwner(userId) && !isShopAdmin(userId) ? { userId } : { nonExistentField: true };

  return { ...baseProductsSelector(), ...baseSelector, ...clientSelector };
}

Meteor.publishUnderDifferentName(
  "sellerProducts",
  ReactionCore.Collections.Products,
  "SellerProducts",
  getSellerProductsSelector,
  getProductsPubOptions,
  extendProductWithLocation
);
