
Template.dashboardSettlementsList.helpers({
  products: function (data) { // override to show only this users products
    //let SellerProducts = Meteor.subscribe("SellerProducts");
    if (ReactionCore.MeteorSubscriptions_SellerProducts.ready()) {
      //console.log("helper Template.dashboardTransactionsList.helpers using publication SellerProducts.");
      return ReactionCore.Collections.Products.find({userId: Meteor.userId()});
    }
  },
});

Template.dashboardSettlementsList.events({
  "click .btn-add-settlement": function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    // trigger click on add product button in user menu
    
  }
});

Template.dashboardSettlementsList.onCreated(function() {
  this.cleaned = false;
  ReactionCore.MeteorSubscriptions_SellerProducts = Meteor.subscribe("SellerProducts");

  this.autorun(() => {
    if (this.cleaned == false && ReactionCore.MeteorSubscriptions_SellerProducts.ready()) {
      // delete products with no title, description and image
      let products = ReactionCore.Collections.Products.find({userId: Meteor.userId()}).fetch();
      console.log("products: ",products);

      for (let product of products) {
        let productId = product._id;
        let media = ReactionCore.Collections.Media.findOne({
          "metadata.productId": product._id,
          "metadata.priority": 0,
          "metadata.toGrid": 1
        }, { sort: { uploadedAt: 1 } });
        console.log("product media: ",media);

        if ( (product.title == null || product.title == "")
            && (product.description == null || product.description == "")
            && media == null) {
          console.log("delete empty product!");
          ReactionCore.Collections.Products.remove({_id: product._id});
        }
      }

      this.cleaned = true;
    }
  });
});

Template.dashboardSettlementsList.onDestroyed(function() {
  // stop that subscription, because we want it only on this page, not on any other
  if (ReactionCore.MeteorSubscriptions_SellerProducts != null) {
    ReactionCore.MeteorSubscriptions_SellerProducts.stop();
  }
});
