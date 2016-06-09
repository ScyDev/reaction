
Template.dashboardProductsList.inheritsHelpersFrom("productList"); // for media
Template.dashboardProductsList.inheritsHooksFrom("productList"); // needed to make products show up
Template.dashboardProductsList.inheritsHelpersFrom("gridContent"); // for price

Template.dashboardProductsList.helpers({
  products: function (data) { // override to show only this users products
    //let SellerProducts = Meteor.subscribe("SellerProducts");
    if (ReactionCore.MeteorSubscriptions_SellerProducts.ready()) {
      //console.log("helper Template.dashboardProductsList.helpers using publication SellerProducts.");
      return ReactionCore.Collections.Products.find({userId: Meteor.userId()});
    }
  },
  isProdsSubReady: function () {
    if (ReactionCore.MeteorSubscriptions_SellerProducts.ready()) {
      return true;
    }
    else {
      return false;
    }
  }
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
