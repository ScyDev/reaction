Template.clone("imageUploader", "_imageUploader")
Template.imageUploaderMarketplace.replaces("imageUploader");

Template.wrapEventHandlers("imageUploader", "click .remove-image", function(event, handlers) {
  if (Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) handlers(event)
});

/**
 * uploadHandler method
 */
function uploadHandler(event) {
  if (!Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) {
    Alerts.toast("Only product owners are allowed to upload the product images.", "warn");
    return;
  }

  const Media = ReactionCore.Collections.Media;
  const productId = ReactionProduct.selectedProductId();
  const variant = ReactionProduct.selectedVariant();
  if (typeof variant !== "object")
    return Alerts.add("Please, create new Variant first.", "danger", { autoHide: true });

  const variantId = variant._id;
  const shopId = ReactionProduct.selectedProduct().shopId || ReactionCore.getShopId();
  const userId = Meteor.userId();
  let count = Media.find({ "metadata.variantId": variantId }).count();
  const toGrid = variant.ancestors.length === 1;

  if(ReactionProduct.selectedProduct().isActive)
    Alerts.toast(i18next.t("productDetail.needsReview", "Product changed, it needs to be activated again."), "info");

  return FS.Utility.eachFile(event, function (file) {
    const fileObj = new FS.File(file);
    fileObj.metadata = {
      ownerId: userId,
      productId: productId,
      variantId: variantId,
      shopId: shopId,
      priority: count,
      toGrid: +toGrid // we need number
    };
    try { Media.insert(fileObj); }
    catch(error) {
      console.log("error:", error);
      if (error.reason == "imageTooBig") Alerts.alert({
        title: i18next.t("accountsUI.error.imageTooBig", "Image too big"),
        text: i18next.t("accountsUI.error.imageTooBigText", {defaultValue: "Please try a smaller image", maxKb: error.details.maxKb}),
        type: "error",
      });
    }
    return count++;
  });
}

Template.overrideEventHandlers("productImageGallery", "dropped #galleryDropPane", uploadHandler);
Template.overrideEventHandlers("imageUploader", "change #files", uploadHandler);
Template.overrideEventHandlers("imageUploader", "dropped #dropzone", uploadHandler);

/* Allow image delete only by product owner */
Template.wrapEventHandlers("productImageGallery", "click .remove-image", (event, instance, handlers) => {
  if (Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) handlers();
});
