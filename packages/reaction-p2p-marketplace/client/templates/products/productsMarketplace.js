
Template.productsMarketplace.replaces("products");

Template.productsViewSwitcher.events({
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
    $(".map-container").css({ opacity: 1.0 }); // map was hidden with opacity, because with display:none; it wouldn't load contents
    return $(".product-map").show();
  },
});

Template.registerHelper("isLoggedIn", function (showInfoPopup) {
  if (typeof ReactionCore === "object") {
    const shopId = ReactionCore.getShopId();
    const user = Accounts.user();
    console.log("helper isLoggedIn() shopId:",shopId," user:",user);
    if (!shopId || typeof user !== "object") return null;
    // shoppers should always be guests
    const isGuest = Roles.userIsInRole(user, "guest", shopId);
    // but if a user has never logged in then they are anonymous
    const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);
    console.log("helper isLoggedIn() isGuest:",isGuest," isAnonymous:",isAnonymous);

    if (isAnonymous && showInfoPopup) {
      Alerts.alert({
        title: i18next.t("productDetail.notLoggedIn", "Not logged in"),
        text: i18next.t("productDetail.youNeedToLogIn", "You need to log in or register."),
        type: "info",
      },
      function() {
        // ...
      }
      );
    }

    return !isAnonymous; // what is guest? because isGuest is true even for logged in user.
  }
});
