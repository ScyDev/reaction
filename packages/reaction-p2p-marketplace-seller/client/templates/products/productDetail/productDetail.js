
Template.productDetailMarketplace.replaces("productDetail");

Template.productDetail.events({ // for some strange reason our custom event needs to be speficied on the template that we override. doesn't work with our new template name.
  "click .toggle-product-isActive-link": function (event, template) {
    Alerts.removeSeen();
    let errorMsg = "";
    const self = this;
    if (!self.title) {
      errorMsg += `${i18next.t("error.isRequired", { field: i18next.t("productDetailEdit.title") })} `;
      template.$(".title-edit-input").focus();
    }
    const variants = ReactionProduct.getVariants(self._id);
    for (let variant of variants) {
      let index = _.indexOf(variants, variant);
      if (!variant.title) {
        errorMsg += `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.title"), number: index + 1 })} `;
      }
      if (!variant.price) {
        errorMsg += `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.price"), number: index + 1 })} `;
      }
    }
    if (errorMsg.length > 0) {
      Alerts.inline(errorMsg, "error", {
        placement: "productManagement",
        i18nKey: "productDetail.errorMsg"
      });
    } else {
      Meteor.call("products/activateProduct", self._id, function (error) {
        if (error) {
          errorMsg = `${i18next.t("error.noProfileAddress")} `;

          return Alerts.inline(errorMsg, "error", {
            placement: "productManagement",
            //id: self._id, // this doesn't work on existing prodcuts?
            i18nKey: "productDetail.errorMsg"
          });
        }
      });
    }
  },
  "click .save-product-link": function (event, template) {
    Alerts.removeSeen();
    Alerts.toast(i18next.t("productDetail.changeSaved", "Product saved"), "info");
    $(".save-product-link").blur();
  },
});

Template.registerHelper("belongsToCurrentUser", function (productId) {
  if (_.isArray(productId) === true) {
    productId = productId[0];
  }

  let productBelongingToCurrUser = ReactionCore.Collections.Products.findOne({_id:productId, userId:Meteor.userId()})
  //console.log("Template.helpers.belongsToCurrentUser() Product ",productId," belongs to ",Meteor.userId(),"?");
  //console.log("Template.helpers.belongsToCurrentUser() productBelongingToCurrUser ",productBelongingToCurrUser);
  return ((productBelongingToCurrUser != null) || ReactionCore.hasAdminAccess());
});

Template.productDetail.onRendered(function(){
  let productId = ReactionRouter.current().params.handle;

  Meteor.call("products/checkIfExpired", productId);
});

Template.productDetail.onDestroyed(function(){
  console.log("Template productDetail destroyed! showing ReactionProduct: ",ReactionProduct);

  let productId = ReactionProduct.selectedProductId();
  let media = ReactionCore.Collections.Media.findOne({
    "metadata.productId": productId,
    "metadata.priority": 0,
    "metadata.toGrid": 1
  }, { sort: { uploadedAt: 1 } });
  console.log("product media: ",media);

  if ($('.product-detail-edit .title-edit-input').val() == ""
      && $('.product-detail-edit.description-edit .description-edit-input').val() == ""
      && media == null) {
    console.log("delete empty product!");
    ReactionCore.Collections.Products.remove({_id: productId});
  }
});
