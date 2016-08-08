Template.marketplaceProductList.onCreated(function() {
  const self = this;
  if (typeof self.data !== "object" || self.data === null ) self.data = {};
  // console.log("productList", self.data)

  // Initialize product subscription and filters
  initializeViewData(self, self.data.publication || "publicProducts", self.data.filtersAccessor || "productGridFilters");
});

/**
 * productList helpers
 */
Template.marketplaceProductList.helpers({
  products: () => {
    const self = Template.instance();
    /* If additional data is loading use the previous fetch result */
    const loadingData = !self.dataLoaded.get() || self.loadingMoreData.get();
    if (loadingData) return self.products;

    const collection = self.publication.capitalize();
    const products = ReactionCore.Collections[collection].find(Session.get(`${self.filtersAccessor}/selector`), { sort: { latestOrderDate: 1 }}).fetch();
    return products;
  },

  media: function() {
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
