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
  }],
});
