Template.marketplaceProductDetailEdit.replaces("productDetailEdit");


Template.productDetailEdit.helpers({
  getType: (type = "text") => type,
});


Template.overrideEventHandlers( "productDetailEdit", "change input,textarea", function (event) {
  const self = this;
  const productId = ReactionProduct.selectedProductId();

  if ((self.field == "title" || self.field == "description")
    && ReactionProduct.selectedProduct().isActive
    && !ReactionProduct.selectedProduct().soldOne ) {
    Alerts.toast(i18next.t("productDetail.needsReview", "Product changed, it needs to be activated again."), "info");
  }

  Meteor.call("products/updateProductField", productId, self.field,
    $(event.currentTarget).val(), (error, result) => {
      if (error) {
        Alerts.removeSeen();
        Alerts.removeType("error");
        return Alerts.inline(`${i18next.t("productDetail."+ReactionCore.toI18nKey(error.reason))} `, "error", {
          placement: "productManagement",
          i18nKey: "productDetail.errorMsg",
          id: self._id
        });
      }
      if (result) {
        Alerts.removeSeen();

        // redirect to new url on title change
        if (self.field === "title")
          Meteor.call("products/setHandle", productId, (err, res) => {
            if (err) {
              Alerts.removeSeen();
              Alerts.inline(err.reason, "error", {
                placement: "productManagement",
                i18nKey: "productDetail.errorMsg",
                id: self._id
              });
            }
            if (res) ReactionRouter.go("product", { handle: res });
          });

        // animate updated field
        // TODO this needs to be moved into a component
        return $(event.currentTarget)
          .animate({ backgroundColor: "#e2f2e2"})
          .animate({ backgroundColor: "#fff" });
      }
  });

  if (this.type === "textarea") autosize($(event.currentTarget));

  return Session.set("editing-" + this.field, false);
});
