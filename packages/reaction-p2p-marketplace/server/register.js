ReactionCore.registerPackage({
  label: "P2P Marketplace",
  name: "p2p-marketplace",
  icon: "fa fa-cog",
  autoEnable: true,
  settings: {
    public: {
      maxUploadSize: 1048576,
      imageAutoOrient: true,
    },
  },
  registry: [{
    provides: "dashboard",
    label: "Marketplace",
    description: "P2P Marketplace settings",
    icon: "fa fa-cog",
    container: "core",
  }, {
    template: "p2pMarketplaceSettings",
    label: "P2P Marketplace Settings",
    provides: "settings",
    container: "core"
  }, {
    route: "/account/seller/products",
    template: "dashboardProductsList",
    name: "account/seller/products",
    label: "My Products",
    icon: "fa fa-cutlery",
    provides: "userAccountDropdown"
  }, {
    route: "/account/seller/sellerorders",
    template: "sellerOrders",
    name: "account/seller/sellerorders",
    label: "My Orders",
    icon: "fa fa-shopping-bag",
    provides: "userAccountDropdown",
    permissions: [{
      label: "Seller Orders",
      permission: "account/seller/sellerorders"
    }]
  }],
});
