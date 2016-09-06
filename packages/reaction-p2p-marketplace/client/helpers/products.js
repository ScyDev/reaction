/**
 * maybeDeleteProduct
 * @summary confirm product deletion, delete, and alert
 * @todo - refactor this back into templates. this is bad.
 * @param {Object} product - product Object
 * @return {Object} - returns nothing, and alerts,happen here
 */
ReactionProduct.maybeDeleteProduct = maybeDeleteProduct = (product) => {
  let productIds;
  let title;
  let confirmTitle = "Delete this product?";

  if (_.isArray(product)) {
    if (product.length === 1) {
      title = product[0].title || i18next.t("accountsUI.theProduct", 'the product');
      productIds = [product[0]._id];
    } else {
      title = "the selected products";
      confirmTitle = "Delete selected products?";

      productIds = _.map(product, (item) => {
        return item._id;
      });
    }
  } else {
    title = product.title || i18next.t("accountsUI.theProduct", 'the product');
    productIds = [product._id];
  }

  if (confirm(confirmTitle)) {
    return Meteor.call("products/deleteProduct", productIds, function (error, result) {
      let id = "product";
      if (error || !result) {
        Alerts.toast(`There was an error deleting ${title}`, "error", {
          i18nKey: "productDetail.productDeleteError"
        });
        throw new Meteor.Error("Error deleting product " + id, error);
      } else {
        ReactionRouter.go("/");
        return Alerts.toast(`Deleted ${title}`, "info");
      }
    });
  }
};
