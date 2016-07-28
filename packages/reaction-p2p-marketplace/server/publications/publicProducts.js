const getPublicProductsSelector = (clientSelector, userId) => {
  /* Basic set of filters = do not apply any if current user is shop admin */
  const baseSelector = isShopAdmin(userId) ? {} : {
    // check quantity
    isSoldOut: false,
    // only products that are visible and enabled by their owner
    isVisible: true,
    isActive: true,
    // filter by latest order date AND sale date - both should be not less than today
    latestOrderDate: {
      "$gte": new Date() // Date is necessary, moment won't work for query
      // "$gte": new Date(moment().format("MM/DD/YYYY HH:mm")) // Date is necessary, moment won't work for query
    },
    forSaleOnDate: {
      "$gte": new Date()
      // "$gte": new Date(moment().format("MM/DD/YYYY"))
    },
  };

  /* Cleanup lat/lon as we do not have them on server */
  if (clientSelector["location.lat"]) delete clientSelector["location.lat"];
  if (clientSelector["location.lon"]) delete clientSelector["location.lon"];

  return { ...baseProductsSelector(), ...baseSelector, ...clientSelector };
}

Meteor.publishUnderDifferentName(
  "publicProducts",
  ReactionCore.Collections.Products,
  "PublicProducts",
  getPublicProductsSelector,
  getProductsPubOptions,
  extendProductWithLocation
);
