/**
 * loadMoreItems
 * @summary whenever list view is scrolled to the bottom, retrieve more results this increments 'scrollLimit'
 * @return {undefined}
 */
function loadMoreItems(templateInstance, force = false) {
  if (!templateInstance || !templateInstance.scrollLimit || templateInstance.loadingMoreData.get()) return

  const scrollContainer = $("#main"); // To find better way to determine scroll container
  const scrollPosition = scrollContainer.scrollTop();

  /* Scrolled to the bottom */
  if (force || scrollContainer.prop('scrollHeight') - scrollContainer.height() ===  scrollPosition) {
    templateInstance.loadingMoreData.set(true);
    templateInstance.scrollLimit.set(templateInstance.scrollLimit.get() + ITEMS_INCREMENT || 24);
  }
}

Template.productGrid.onCreated(function() {
  const self = this;
  if (typeof self.data !== "object" || self.data === null ) self.data = {};
  // console.log("productGrid", self.data)

  // Initialize product subscription and filters
  initializeViewData(self, self.data.publication || "publicProducts", self.data.filtersAccessor || "productGridFilters");

  self.selectedProducts = new ReactiveVar([]);
  self.autorun(() => !ReactionCore.isActionViewOpen() && self.selectedProducts.set([]));
});

Template.productGrid.onRendered(function() {
  const self = this;
  /* React on #main view scroll */
  $("#main").on("scroll", () => loadMoreItems(self));
});

Template.productGrid.events({
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
 * productGrid helpers
 */
Template.productGrid.helpers({
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
