Template.marketplaceProductDetailEdit.replaces("productDetailEdit");


Template.productDetailEdit.helpers({
  getType: (type = "text") => type,
});


Template.overrideEventHandlers( "productDetailEdit", "change input,textarea", function (event) {
  const productId = ReactionProduct.selectedProductId();

  if ((this.field == "title" || this.field == "description")
    && ReactionProduct.selectedProduct().isActive
    && !ReactionProduct.selectedProduct().soldOne ) {
    Alerts.toast(i18next.t("productDetail.needsReview", "Product changed, it needs to be activated again."), "info");
  }

  Meteor.call("products/updateProductField", productId, this.field,
    $(event.currentTarget).val(), (error, result) => {
      Alerts.removeSeen();
      if (error) {
        Alerts.removeType("error");
        return Alerts.inline(`${i18next.t("productDetail." + ReactionCore.toI18nKey(error.reason))}`, "error", {
          placement: "productManagement",
          i18nKey: "productDetail.errorMsg",
          id: this._id,
        });
      }
      if (result) {
        // redirect to new url on title change
        if (this.field === "title")
          Meteor.call("products/setHandle", productId, (err, res) => {
            if (err) {
              Alerts.removeSeen();
              Alerts.inline(err.reason, "error", {
                placement: "productManagement",
                i18nKey: "productDetail.errorMsg",
                id: this._id
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
