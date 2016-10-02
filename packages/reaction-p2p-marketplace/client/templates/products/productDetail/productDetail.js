// Event handlers are to be specified on the template that we override for indirect template calls.
Template.productDetailMarketplace.replaces("productDetail");


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

Template.productDetail.onDestroyed(function(){
  console.log("Template productDetail destroyed! showing ReactionProduct: ",ReactionProduct);

  const productId = Template.instance().productId();
  const media = ReactionCore.Collections.Media.findOne({
    "metadata.productId": productId,
    "metadata.priority": 0,
    "metadata.toGrid": 1
  }, { sort: { uploadedAt: 1 } });
  console.log("product media:", media);

  if ($('.product-detail-edit .title-edit-input').val() === ""
    && $('.product-detail-edit.description-edit .description-edit-input').val() === ""
    && media === null) {
    console.log("delete empty product!");
    Template.instance().collection.remove({_id: productId}); // TODO: This is insecure to change data from client side! Need to be fixed!
  }
});

Template.productDetail.onRendered(function() {
  console.info("productDetailMarketplace.onRendered");
});


Template.productDetail.helpers({
  product: () => {
    const self = Template.instance();
    ReactionProduct.setProduct(self.productId(), self.variantId()); // To be used in 'productImageGallery' template later
    return self.subscriptionsReady() && self.collection && self.collection.findOne({_id: self.productId()});
  },
  tagsComponent: function () {
    if (ReactionCore.hasPermission("createProduct") && Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) {
      return Template.productTagInputForm;
    }
    return Template.productDetailTags;
  },
  fieldComponent: function (callerName) {
    console.log("fieldComponent", callerName, ReactionCore.hasPermission("createProduct"), Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId()))
    return ReactionCore.hasPermission("createProduct")
           && Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())
      ? Template.productDetailEdit : Template.productDetailField;
  },
  metaComponent: function () {
    if (ReactionCore.hasPermission("createProduct") && Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) {
      return Template.productMetaFieldForm;
    }
    return Template.productMetaField;
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

Template.wrapEventHandlers("productDetail", "click #price", (event, instance, handlers) => {
  if (Blaze._globalHelpers.belongsToCurrentUser(ReactionProduct.selectedProductId())) handlers();
});
Template.overrideEventHandlers("productDetail", "click #add-to-cart", function(event, instance) {
  // allow only logged in users to do that
  if (!Blaze._globalHelpers.isLoggedIn(true)) return;
  console.log("productDetail", this)

  let productId;
  let qtyField;
  let quantity;
  const currentVariant = ReactionProduct.selectedVariant();
  const currentProduct = ReactionProduct.selectedProduct();

  if (currentVariant) {
    if (currentVariant.ancestors.length === 1) {
      const options = ReactionProduct.getVariants(currentVariant._id);

      if (options.length > 0) {
        Alerts.inline("Please choose options before adding to cart", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.chooseOptions",
          autoHide: 10000
        });
        return [];
      }
    }

    if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
      Alerts.inline("Sorry, this item is out of stock!", "warning", {
        placement: "productDetail",
        i18nKey: "productDetail.outOfStock",
        autoHide: 10000
      });
      return [];
    }

    qtyField = instance.$('input[name="addToCartQty"]');
    quantity = parseInt(qtyField.val(), 10);

    if (quantity < 1) quantity = 1;

    if (!this.isVisible) {
      Alerts.inline("Publish product before adding to cart.", "error", {
        placement: "productDetail",
        i18nKey: "productDetail.publishFirst",
        autoHide: 10000
      });
    } else {
      productId = currentProduct._id;

      if (productId) {
        Meteor.call("cart/addToCart", productId, currentVariant._id, quantity, error => {
          if (!error) return;
          ReactionCore.Log.error("Failed to add to cart.", error);
          if (error.reason === "Not enough items in stock") {
            Alerts.inline("Sorry, can't add more items than available!", "warning", {
              placement: "productDetail",
              i18nKey: "productDetail.outOfStock",
              autoHide: 10000
            });
          }
          return error;
        });
      }

      instance.$(".variant-select-option").removeClass("active");
      ReactionProduct.setCurrentVariant(null);
      qtyField.val(1);

      // scroll to top on cart add
      $('html, body').animate({
        scrollTop: $("#products-anchor").offset().top
      }, "fast");

      // slide out label
      const addToCartText = i18next.t("productDetail.addedToCart");
      const addToCartTitle = currentVariant.title || "";
      $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);

      return $(".cart-alert").toggle("slide", {
        direction: i18next.t("languageDirection") === "rtl" ? "left" : "right",
        width: currentVariant.title.length + 50 + "px"
      }, 600).delay(4000).toggle("slide", {
        direction: i18next.t("languageDirection") === "rtl" ? "left" : "right"
      });
    }
  } else Alerts.inline("Select an option before adding to cart", "warning", {
    placement: "productDetail",
    i18nKey: "productDetail.selectOption",
    autoHide: 8000
  });
});


Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});

Template.wrapEventHandlers("productDetail", "click .delete-product-link", (event, instance, handlers) => {
  if (!ReactionProduct.selectedProduct().soldOne) handlers();
});


// Template.overrideEventHandlers("productDetail", "click .toggle-product-isActive-link", () => {});
Template.overrideEventHandlers("productDetail", "click .toggle-product-isActive-link", function (event, template) {
  Alerts.removeSeen();
  let errorMsg = "";
  const self = this;

  const selectedProduct = Template.instance().product;

  if (!self.title) {
    errorMsg += `${i18next.t("error.isRequired", {field: i18next.t("productDetailEdit.title")})}\n`;
    template.$(".title-edit-input").focus();
  }
  // console.log("toggle-product-isActive-link", self._id, self)
  const variants = ReactionProduct.getVariants(self._id);
  for (let variant of variants) {
    let index = _.indexOf(variants, variant);
    if (!variant.title) {
      errorMsg += `${i18next.t("error.variantFieldIsRequired", {
        field: i18next.t("productVariant.title"),
        number: index + 1
      })}\n`;
    }
    if (!variant.price) {
      errorMsg += `${i18next.t("error.variantFieldIsRequired", {
        field: i18next.t("productVariant.price"),
        number: index + 1
      })}\n`;
    }
  }
  if (!/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(selectedProduct.pickupTimeFrom)) {
    errorMsg += `${i18next.t("productDetail.pickupTimeFromIsRequired", {field: i18next.t("productDetail.pickupTimeFrom")})}\n`;
  }
  if (!/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(selectedProduct.pickupTimeTo)) {
    errorMsg += `${i18next.t("productDetail.pickupTimeToIsRequired", {field: i18next.t("productDetail.pickupTimeTo")})}\n`;
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

    const pickupDate = moment(selectedProduct.forSaleOnDate);
    const latestOrderDate = moment(selectedProduct.latestOrderDate);

    const lastestOrderDateTooLate = latestOrderDate.format("YYYY-MM-DD") > pickupDate.format("YYYY-MM-DD");
    let delta = 1000;
    if (pickupDate.format("YYYY-MM-DD") == latestOrderDate.format("YYYY-MM-DD")) {
      const fromHours = parseInt(selectedProduct.pickupTimeFrom.slice(0, 2));
      const fromMinutes = parseInt(selectedProduct.pickupTimeFrom.slice(3));
      delta = ( fromHours * 60 + fromMinutes ) - ( latestOrderDate.hours() * 60 + latestOrderDate.minutes() );
      console.log("Time difference:", delta, "minutes");
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
        function (isConfirm) {
          if (isConfirm) {
            execMeteorCallActivateProduct();
          }
        });
    }
    else if (delta <= 60 || lastestOrderDateTooLate) {

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
        function (isConfirm) {
          if (isConfirm) {
            execMeteorCallActivateProduct();
          }
        });
    }
    else {
      execMeteorCallActivateProduct();
    }
  }
});

Template.productDetail.events({
  "click .save-product-link": function (event, template) {
    Alerts.removeSeen();
    Alerts.toast(i18next.t("productDetail.changeSaved", "Product saved"), "info");
    $(".save-product-link").blur();
  },
});
