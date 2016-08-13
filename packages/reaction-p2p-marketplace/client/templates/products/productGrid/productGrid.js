/**
 * loadMoreItems
 * @summary whenever list view is scrolled to the bottom, retrieve more results this increments 'scrollLimit'
 * @return {undefined}
 */
function loadMoreItems(templateInstance, force = false) {
  if (!templateInstance || !templateInstance.scrollLimit || templateInstance.loadingMoreData.get()) return

  const loadMoreButton = document.getElementById("productScrollLimitLoader");
  const reachedLoadMoreButton = loadMoreButton && loadMoreButton.getBoundingClientRect().top < window.innerHeight - 100;
  // console.log("scroll", reachedLoadMoreButton, loadMoreButton && loadMoreButton.getBoundingClientRect(), window.innerHeight - 100 )

  /* Scrolled to the bottom */
  if (force || reachedLoadMoreButton) {
    templateInstance.loadingMoreData.set(true);
    templateInstance.scrollLimit.set(templateInstance.scrollLimit.get() + ITEMS_INCREMENT || 24);
  }
}

Template.marketplaceProductGrid.onCreated(function() {
  const self = this;
  if (typeof self.data !== "object" || self.data === null ) self.data = {};
  // console.log("productGrid", self.data)

  // Initialize product subscription and filters
  initializeViewData(self, self.data.publication || "publicProducts", self.data.filtersAccessor || "productGridFilters");

  self.selectedProducts = new ReactiveVar([]);
  self.autorun(() => !ReactionCore.isActionViewOpen() && self.selectedProducts.set([]));
});

Template.marketplaceProductGrid.onRendered(function() {
  const self = this;
  /* React on #main view scroll */
  $("#main").on("scroll", () => loadMoreItems(self));
  $(window).on("scroll", () => loadMoreItems(self));
});

Template.marketplaceProductGrid.events({
  "click #loadMoreItems": (event) => {
    event.preventDefault();
    loadMoreItems(Template.instance(), true);
  },
  "change input[name=selectProduct]": (event) => {
    const self = Template.instance();
    const clickedProductId = event.target.value;

    let selectedProducts = self.selectedProducts.get();
    if (selectedProducts.indexOf(clickedProductId) === -1)
      selectedProducts.push(clickedProductId);
    else
      selectedProducts = selectedProducts.filter(item => item !== clickedProductId);

    self.selectedProducts.set(selectedProducts);

    const products = self.products.filter( product => selectedProducts.indexOf(product._id) > -1 );
    ReactionCore.showActionView({
      label: "Edit Product",
      template: "productSettings",
      type: "product",
      data: { products },
    });
  }
});

/**
 * marketplaceProductGrid helpers
 */
Template.marketplaceProductGrid.helpers({
  moreProductsAvailable: () => {
    return ReactionCore.Collections.PublicProducts.find().count() >= Template.instance().scrollLimit.get();
  },

  products: () => {
    const self = Template.instance();
    /* If additional data is loading use the previous fetch result */
    const loadingData = !self.dataLoaded.get() || self.loadingMoreData.get();
    if (loadingData) return self.products;

    const collection = self.publication.capitalize();
    const products = ReactionCore.Collections[collection].find(Session.get(`${self.filtersAccessor}/selector`), { sort: { latestOrderDate: 1 }}).fetch();

    /* What is this for ?? */
    for (let product of products) {
      const _results = [];
      for (let position of product.positions || []) {
        if (position.tag === ReactionCore.getCurrentTag()) _results.push(position);
      }
      product.position = _results.length ? _results[0] : {
        position: 0,
        weight: 0,
        pinned: false,
        updatedAt: product.updatedAt,
      };
    }

    self.products = products;
    return products;
  },
});
