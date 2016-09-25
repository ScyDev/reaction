/**
 * products publication
 * @return {Object} return product cursor
 */
Meteor.publish("ProductsForOrdersHistory", function () {
  const Products = ReactionCore.Collections.Products;
  return Products.find({});
});
