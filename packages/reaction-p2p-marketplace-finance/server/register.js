
ReactionCore.registerPackage({
  label: "Marketplace Finance",
  name: "reaction-p2p-marketplace-finance",
  icon: "fa fa-money",
  autoEnable: true,
  settings: {
    settlements: {
      ourFeePercent: "10",
    },
  },
  registry: [
    {
      route: "/dashboard/settlements",
      template: "dashboardSettlementsList",
      name: "dashboard/settlements",
      label: "Settlements",
      icon: "fa fa-money",
      provides: "userAccountDropdown"
    },
  ],
});
