/* eslint camelcase: 0 */

ReactionCore.registerPackage({
  label: "Marketplace",
  icon: "fa fa-users",
  name: "reaction-p2p-marketplace", // usually same as meteor package
  autoEnable: true, // auto-enable in dashboard
  settings: // private package settings config (blackbox)
  {
    public: {
      autoselect_country: true
    }
  },
  registry: [
    // all options except route and template
    // are used to describe the
    // dashboard "app card".

    {
      provides: "dashboard",
      label: "Marketplace",
      description: "Marketplace",
      icon: "fa fa-users",
      priority: 2,
      container: "marketplace",
      template: "marketplace",
      permissions: [
        {
          label: "Marketplace Dashboard",
          permission: "dashboard/marketplace"
        }
      ]
    },
    {
      label: "Marketplace Settings",
      route: "/dashboard/marketplace",
      provides: "settings",
      container: "dashboard",
      template: "marketplaceSettings"
    }
  ]
});
