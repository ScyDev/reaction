ReactionCore.registerPackage({
  label: "Marketplace Profile",
  name: "reaction-p2p-marketplace-profile",
  icon: "fa fa-cubes",
  autoEnable: true,
  registry: [{
    route: "/profile/:userId",
    name: "marketplaceProfile",
    template: "marketplaceProfile",
    //workflow: "coreProductWorkflow"
  }],
  /*
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "Products",
    theme: "default",
    enabled: true,
    structure: {
      template: "marketplaceProfile",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "",
      dashboardControls: "dashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]*/
});
