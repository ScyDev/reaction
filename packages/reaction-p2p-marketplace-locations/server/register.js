ReactionCore.registerPackage({
  label: "Locations",
  name: "reaction-p2p-marketplace-locations",
  icon: "fa fa-map",
  autoEnable: true,
  settings: {
    public: {
      googleMapsApiKey: ""
    },
  },
  registry: [{
    // route: "/dashboard/locations",
    provides: "dashboard",
    label: "Locations",
    description: "Locations for products and sellers",
    icon: "fa fa-map",
    // cycle: "4",
    container: "dashboard",
  }, {
    template: "locationsSettings",
    label: "Locations Settings",
    provides: "settings",
    container: "dashboard"
  }],
  // permissions: [
  //   {
  //     label: "Locations",
  //     permission: "dashboard/locations",
  //     group: "Locations Settings"
  //   }
  // ]
});
