Template.p2pMarketplaceSettings.helpers({
  packageData: () => ReactionCore.Collections.Packages.findOne({ name: "p2p-marketplace" }),
});

AutoForm.hooks({
  "p2p-marketplace-settings-form": {
    onSuccess: (operation, result, template) => {
      Alerts.removeSeen();
      return Alerts.add("P2P Marketplace settings saved.", "success", { autoHide: true });
    },
    onError: (operation, error, template) => {
      Alerts.removeSeen();
      return Alerts.add("P2P Marketplace settings update failed. " + error, "danger");
    }
  }
});
