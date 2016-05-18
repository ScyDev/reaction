/**
 * productList helpers
 */

let Media;
Media = ReactionCore.Collections.Media;
Template.productList.helpers({
  products: function () {
    return ReactionProduct.getProductsByTag(this.tag);
  },
  media: function () {
    const media = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this._id,
      //"metadata.priority": 0, // this will fail to find an image if none has prio 0, use sort instead
      "metadata.toGrid": 1
    }, { sort: { "metadata.priority": 1, uploadedAt: 1 } });

    return media instanceof FS.File ? media : false;
  },
  displayPrice: function () {
    return this._id && this.price && this.price.range;
  },
});
