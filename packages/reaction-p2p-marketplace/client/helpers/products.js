// /**
//  * maybeDeleteProduct
//  * @summary confirm product deletion, delete, and alert
//  * @param {Object} product - product Object
//  * @return {Object} - returns nothing, and alerts,happen here
//  */
// ReactionProduct.maybeDeleteProduct = maybeDeleteProduct = (product) => {
//   let productIds;
//   let title;
//   let confirmTitle = "Delete this product?";
//
//   if (_.isArray(product)) {
//     if (product.length === 1) {
//       title = product[0].title || i18next.t("accountsUI.theProduct", 'the product');
//       productIds = [product[0]._id];
//     } else {
//       title = "the selected products";
//       confirmTitle = "Delete selected products?";
//
//       productIds = _.map(product, (item) => {
//         return item._id;
//       });
//     }
//   } else {
//     title = product.title || i18next.t("accountsUI.theProduct", 'the product');
//     productIds = [product._id];
//   }
//
//   if (confirm(confirmTitle)) {
//     return Meteor.call("products/deleteProduct", productIds, function (error, result) {
//       let id = "product";
//       if (error || !result) {
//         Alerts.toast(`There was an error deleting ${title}`, "error", {
//           i18nKey: "productDetail.productDeleteError"
//         });
//         throw new Meteor.Error("Error deleting product " + id, error);
//       } else {
//         ReactionRouter.go("/");
//         return Alerts.toast(`Deleted ${title}`, "info");
//       }
//     });
//   }
// };
//

/**
 * maybeDeleteProduct
 * @summary confirm product deletion, delete, and alert
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.maybeDeleteProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  const productIds = _.map(products, product => product._id);
  let title;
  let confirmTitle;
  if (products.length === 1) {
    title = products[0].title || i18next.t("accountsUI.theProduct", 'the product');
    confirmTitle = i18next.t("productDetail.deletedProductConfirm", "Delete this product?");
  } else {
    title = "the selected products";
    confirmTitle = i18next.t("productDetail.deletedProductsConfirm", "Delete the selected products?");
  }

  Alerts.alert({
      title: i18next.t("productDetail.areYouSure", "Are you sure?"),
      text: confirmTitle,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: i18next.t("productDetail.yes", "Yes"),
      cancelButtonText: i18next.t("productDetail.no", "No"),
      closeOnConfirm: true,
      closeOnCancel: true
    },
    function(isConfirm){
      if (isConfirm) {
        Meteor.call("products/deleteProduct", productIds, function (error, result) {
          if (error !== undefined || !result) {
            Alerts.toast(i18next.t("productDetail.deletedProductFailed")+" "+title, "error", {
              i18nKey: "productDetail.productDeleteError"
            });
            throw new Meteor.Error("Error deleting " + title, error);
          } else {
            ReactionRouter.go("/");
            Alerts.toast(i18next.t("productDetail.deletedAlert") + " " + title, "info");
          }
        });
      }
    });
};


Template.registerHelper("belongsToCurrentUser", function (productId, callerName) {
  if (_.isArray(productId) === true) productId = productId[0];
  const result = !!(Template.instance().canEdit || typeof ReactionCore.Collections.SellerProducts.findOne({ _id: productId }) !== "undefined" || ReactionCore.hasAdminAccess());
  // console.warn("belongsToCurrentUser", productId, callerName, result, typeof Template.instance().canEdit, typeof ReactionCore.Collections.SellerProducts.findOne({ _id: productId }), ReactionCore.hasAdminAccess());
  return result;
});
