/**
 * productList helpers
 */

let Media;
Media = ReactionCore.Collections.Media;
Template.productList.helpers({
  products: function () {
    return ReactionProduct.getProductsByTag(this.tag);
  },
  isProdsSubReady: function () {
    if (ReactionCore.MeteorSubscriptions_Products.ready()) {
      return true;
    }
    else {
      return false;
    }
  },
  media: function () {
    const media = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this._id,
      "metadata.priority": 0,
      "metadata.toGrid": 1
    }, { sort: { uploadedAt: 1 } });

    return media instanceof FS.File ? media : false;
  },
  displayPrice: function () {
    return this._id && this.price && this.price.range;
  },
});
