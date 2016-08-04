
Template.productDetailMarketplace.replaces("productDetail");
// Event handlers are to be specified on the template that we override for indirect template calls.

Template.productDetail.onCreated(function() {
  const self = this;

  /* Collect the product ID from URL */
  const productId = self.productId();
  // console.info("productDetailMarketplace.onCreated", self.templateId, productId);
  if (!productId) return;

  // console.log( "Calling 'products/checkIfExpired' method with productId", productId)
  Meteor.call("products/checkIfExpired", productId);

  const setProductDetails = (collection, product, canEdit) => {
    self.product = product;
    self.collection = collection;
    self.canEdit = canEdit || self.canEdit;
  }

  /* We subscribe both to PublicProducts and SellerProducts in parallel. If something found in the latter, it wins. */
  const selector = { _id: productId };
  self.subscribe("publicProducts", { selector }, () => {
    const collection = ReactionCore.Collections.PublicProducts;
    const product = ReactionCore.Collections.PublicProducts.findOne(selector);
    // console.warn("PublicProducts result collected", typeof product !== "undefined");
    if (product) setProductDetails(collection, product, ReactionCore.hasAdminAccess());
  });
  self.subscribe("sellerProducts", {selector}, () => {
    const collection = ReactionCore.Collections.SellerProducts;
    const product = collection.findOne(selector);
    // console.warn("SellerProducts result collected", typeof product !== "undefined");
    if (product) setProductDetails(collection, product, true);
  });
});

Template.productDetail.onRendered(function() {
  console.info("productDetailMarketplace.onRendered");
});

Template.productDetail.events({
  "click .toggle-product-isActive-link": function (event, template) {
    Alerts.removeSeen();
    let errorMsg = "";
    const self = this;

    const selectedProduct = Template.instance().product;

    if (!self.title) {
      errorMsg += `${i18next.t("error.isRequired", { field: i18next.t("productDetailEdit.title") })}\n`;
      template.$(".title-edit-input").focus();
    }
    // console.log("toggle-product-isActive-link", self._id, self)
    const variants = ReactionProduct.getVariants(self._id);
    for (let variant of variants) {
      let index = _.indexOf(variants, variant);
      if (!variant.title) {
        errorMsg += `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.title"), number: index + 1 })}\n`;
      }
      if (!variant.price) {
        errorMsg += `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.price"), number: index + 1 })}\n`;
      }
    }
    if( ! /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(selectedProduct.pickupTimeFrom) ) {
      errorMsg += `${i18next.t("productDetail.pickupTimeFromIsRequired", { field: i18next.t("productDetail.pickupTimeFrom") })}\n`;
    }
    if( ! /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(selectedProduct.pickupTimeTo) ) {
      errorMsg += `${i18next.t("productDetail.pickupTimeToIsRequired", { field: i18next.t("productDetail.pickupTimeTo") })}\n`;
    }
    if (errorMsg.length > 0) {
      Alerts.inline(errorMsg, "error", {
        placement: "productManagement",
        i18nKey: "productDetail.errorMsg"
      });
    } else {
      function execMeteorCallActivateProduct() {
        Meteor.call("products/activateProduct", self._id, function (error) {
          if (error) {
            errorMsg = `${i18next.t(error.reason)}\n`;

            return Alerts.inline(errorMsg, "error", {
              placement: "productManagement",
              //id: self._id, // this doesn't work on existing prodcuts?
              i18nKey: "productDetail.errorMsg"
            });
          }
        });
      }
      const pickupDate = moment( selectedProduct.forSaleOnDate );
      const latestOrderDate = moment( selectedProduct.latestOrderDate );

      const lastestOrderDateTooLate = latestOrderDate.format( "YYYY-MM-DD" ) > pickupDate.format( "YYYY-MM-DD" );
      let delta = 1000;
      if( pickupDate.format( "YYYY-MM-DD" ) == latestOrderDate.format( "YYYY-MM-DD" ) ) {
        const fromHours = parseInt( selectedProduct.pickupTimeFrom.slice(0, 2) );
        const fromMinutes = parseInt( selectedProduct.pickupTimeFrom.slice(3) );
        delta = ( fromHours * 60 + fromMinutes ) - ( latestOrderDate.hours() * 60 + latestOrderDate.minutes() );
        console.log( "Time difference:", delta, "minutes" );
      }

      if (selectedProduct.isActive) {
        execMeteorCallActivateProduct();
      }
      else if (!moment(selectedProduct.forSaleOnDate).isSame(moment(selectedProduct.latestOrderDate), "day")) {
        //console.log(moment(selectedProduct.forSaleOnDate).toString()+" vs. "+moment(selectedProduct.latestOrderDate).toString());

        Alerts.alert({
          title: i18next.t("productDetail.areYouSure", "Are you sure?"),
          text: i18next.t("productDetail.latestOrderDateNotOnSaleDate", "The latest order date is not on for sale date. Are you sure?"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: i18next.t("productDetail.yes", "Yes"),
          cancelButtonText: i18next.t("productDetail.no", "No"),
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
            execMeteorCallActivateProduct();
          }
        });
      }
      else if ( delta <= 60 || lastestOrderDateTooLate ) {

        Alerts.alert({
          title: i18next.t("productDetail.areYouSure", "Are you sure?"),
          text: i18next.t("productDetail.latestOrderDateNearPickupTime", "The latest order date is very near the pickup time. Are you sure?"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: i18next.t("productDetail.yes", "Yes"),
          cancelButtonText: i18next.t("productDetail.no", "No"),
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
            execMeteorCallActivateProduct();
          }
        });
      }
      else {
        execMeteorCallActivateProduct();
      }
    }
  },
  "click .save-product-link": function (event, template) {
    Alerts.removeSeen();
    Alerts.toast(i18next.t("productDetail.changeSaved", "Product saved"), "info");
    $(".save-product-link").blur();
  },
});

Template.registerHelper("belongsToCurrentUser", function (productId) {
  if (_.isArray(productId) === true) productId = productId[0];
  // console.warn( "belongsToCurrentUser", Template.instance().canEdit || typeof ReactionCore.Collections.SellerProducts.findOne({ _id: productId }) !== "undefined" || ReactionCore.hasAdminAccess() );
  return Template.instance().canEdit || typeof ReactionCore.Collections.SellerProducts.findOne({ _id: productId }) !== "undefined" || ReactionCore.hasAdminAccess();
});

Template.productDetail.helpers({
  product: () => {
    const self = Template.instance();
    return self.subscriptionsReady() && self.collection && self.collection.findOne({_id: self.productId()});
  },

  displayProductDetail: () => {
    const { product } = Template.instance();
    const shopId = ReactionCore.getShopId();

    // const productId = Template.instance().productId();
    // console.log("displayProductDetail: ", productId, product);
    if (product.userId == Meteor.userId()
          || Roles.userIsInRole(Meteor.userId(), ["admin"], shopId)
          || (product.isActive && product.isVisible)
        ) {
      console.log("yes, display product detail");
      return true;
    } else {
      console.log("don't display product detail");
      return false;
    }
  },
});


Template.productDetail.onDestroyed(function(){
  console.log("Template productDetail destroyed! showing ReactionProduct: ",ReactionProduct);

  const productId = Template.instance().productId();
  const media = ReactionCore.Collections.Media.findOne({
    "metadata.productId": productId,
    "metadata.priority": 0,
    "metadata.toGrid": 1
  }, { sort: { uploadedAt: 1 } });
  console.log("product media:", media);

  if ($('.product-detail-edit .title-edit-input').val() == ""
      && $('.product-detail-edit.description-edit .description-edit-input').val() == ""
      && media == null) {
    console.log("delete empty product!");
    Template.instance().collection.remove({_id: productId}); // TODO: This is insecure to change data from client side! Need to be fixed!
  }
});
