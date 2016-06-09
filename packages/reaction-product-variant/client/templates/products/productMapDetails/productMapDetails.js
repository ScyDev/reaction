/**
 * productMapDetails helpers
 */

Template.productMapDetails.onRendered( function() {
  console.log("data", this.data);
})

Template.productMapDetails.helpers({
  // products: () => ReactionProduct.getProductsByTag(this.tag),
  mediaUrl: function () {
    const media = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this._id,
      "metadata.toGrid": 1
    }, { sort: { "metadata.priority": 1, uploadedAt: 1 } });

    return media instanceof FS.File ? media.url({ store: "thumbnail" }) : "/resources/placeholder.gif";
  },
  displayPrice: function () {
    return this._id && this.price && this.price.range;
  },
});
