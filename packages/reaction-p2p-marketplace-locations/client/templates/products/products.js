
Template.products.onRendered(
  function() {

  }
);

Template.products.events({
  "click #productListView": function () {
    $(".product-grid").hide();
    $(".product-map").hide();
    return $(".product-list").show();
  },
  "click #productGridView": function () {
    $(".product-list").hide();
    $(".product-map").hide();
    return $(".product-grid").show();
  },
  "click #productMapView": function () {
    $(".product-list").hide();
    $(".product-grid").hide();

    if ($('.product-map').length === 0) { // make sure its only injected once, not on every rendered event
        // inject template here
        Blaze.render(Template.productMap, $(".container-main")[0])
        console.log('injected map');
    }
    return $(".product-map").show();
  },
  "click .product-list-item": function () {
    return Router.go("product", {
      _id: this._id
    });
  }
});
