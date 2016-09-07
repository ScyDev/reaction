// Template.productDetail.helpers({
//   isActive: () =>
//   product: function () {
//     const instance = Template.instance();
//     return instance.subscriptionsReady() && ReactionProduct.setProduct(instance.productId(), instance.variantId());
//   },
// });

Template.productDetail.helpers({
  tagsComponent: function () {
    if (ReactionCore.hasPermission("createProduct") && Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) {
      return Template.productTagInputForm;
    }
    return Template.productDetailTags;
  },
  fieldComponent: function () {
    if (ReactionCore.hasPermission("createProduct") && Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) {
      return Template.productDetailEdit;
    }
    return Template.productDetailField;
  },
  metaComponent: function () {
    if (ReactionCore.hasPermission("createProduct") && Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) {
      return Template.productMetaFieldForm;
    }
    return Template.productMetaField;
  }
});

Template.wrapEventHandlers("productDetail", "click #price", (event, instance, handlers) => {
  if (Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) handlers();
});
Template.overrideEventHandlers("productDetail", "click #add-to-cart", function(event, instance) {
  // allow only logged in users to do that
  if (!Blaze._globalHelpers.isLoggedIn(true)) return;
  console.log("productDetail", this)

  let productId;
  let qtyField;
  let quantity;
  const currentVariant = ReactionProduct.selectedVariant();
  const currentProduct = ReactionProduct.selectedProduct();

  if (currentVariant) {
    if (currentVariant.ancestors.length === 1) {
      const options = ReactionProduct.getVariants(currentVariant._id);

      if (options.length > 0) {
        Alerts.inline("Please choose options before adding to cart", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.chooseOptions",
          autoHide: 10000
        });
        return [];
      }
    }

    if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
      Alerts.inline("Sorry, this item is out of stock!", "warning", {
        placement: "productDetail",
        i18nKey: "productDetail.outOfStock",
        autoHide: 10000
      });
      return [];
    }

    qtyField = instance.$('input[name="addToCartQty"]');
    quantity = parseInt(qtyField.val(), 10);

    if (quantity < 1) quantity = 1;

    if (!this.isVisible) {
      Alerts.inline("Publish product before adding to cart.", "error", {
        placement: "productDetail",
        i18nKey: "productDetail.publishFirst",
        autoHide: 10000
      });
    } else {
      productId = currentProduct._id;

      if (productId) {
        Meteor.call("cart/addToCart", productId, currentVariant._id, quantity, error => {
          if (!error) return;
          ReactionCore.Log.error("Failed to add to cart.", error);
          if (error.reason === "Not enough items in stock") {
            Alerts.inline("Sorry, can't add more items than available!", "warning", {
              placement: "productDetail",
              i18nKey: "productDetail.outOfStock",
              autoHide: 10000
            });
          }
          return error;
        });
      }

      instance.$(".variant-select-option").removeClass("active");
      ReactionProduct.setCurrentVariant(null);
      qtyField.val(1);

      // scroll to top on cart add
      $('html, body').animate({
        scrollTop: $("#products-anchor").offset().top
      }, "fast");

      // slide out label
      const addToCartText = i18next.t("productDetail.addedToCart");
      const addToCartTitle = currentVariant.title || "";
      $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);

      return $(".cart-alert").toggle("slide", {
        direction: i18next.t("languageDirection") === "rtl" ? "left" : "right",
        width: currentVariant.title.length + 50 + "px"
      }, 600).delay(4000).toggle("slide", {
        direction: i18next.t("languageDirection") === "rtl" ? "left" : "right"
      });
    }
  } else Alerts.inline("Select an option before adding to cart", "warning", {
    placement: "productDetail",
    i18nKey: "productDetail.selectOption",
    autoHide: 8000
  });
});

Template.overrideEventHandlers("productDetail", "click .toggle-product-isActive-link", () => {});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});
