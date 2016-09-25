
Template.dashboardProductsList.inheritsHelpersFrom("productList"); // for media
Template.dashboardProductsList.inheritsHooksFrom("productList"); // needed to make products show up
Template.dashboardProductsList.inheritsHelpersFrom("gridContent"); // for price

Template.dashboardProductsList.helpers({
  // products: function (data) { // override to show only this users products
  //   if (ReactionCore.Subscriptions.Products.ready()) {
  //     //console.log("helper Template.dashboardProductsList.helpers using publication SellerProducts.");
  //     return ReactionCore.Collections.Products.find({userId: Meteor.userId()});
  //   }
  // },
  productsMarketplaceOptions: () => ({
    publication: "sellerProducts",
  }),
});

Template.dashboardProductsList.events({
  "click .btn-add-product": function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    // trigger click on add product button in user menu
    $(".dropdown-toggle").dropdown("toggle");
    $('#dropdown-apps-createProduct').trigger('click');
  }
});

Template.dashboardProductsList.onCreated(function() {
  this.cleaned = false;
  const subscription = this.subscribe("sellerProducts");

  /* Delete products with no title, description and image */
  this.autorun(() => {
    if (this.cleaned == false && subscription.ready()) {
      const products = ReactionCore.Collections.SellerProducts.find().fetch();
      console.log("products: ",products);

      for (let product of products) {
        const media = ReactionCore.Collections.Media.findOne({
          "metadata.productId": product._id,
          "metadata.priority": 0,
          "metadata.toGrid": 1
        }, { sort: { uploadedAt: 1 } });
        console.log("product media:", media);

        if ( (product.title == null || product.title == "")
            && (product.description == null || product.description == "")
            && media == null) {
          console.log("delete empty product!");
          ReactionCore.Collections.SellerProducts.remove({_id: product._id});
        }
      }

      this.cleaned = true;
    }
  });
});


