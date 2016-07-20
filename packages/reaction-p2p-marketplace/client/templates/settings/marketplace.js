/* eslint no-unused-vars: 0 */

Template.marketplaceSettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-p2p-marketplace"
    });
  }
});

Template.marketplace.helpers({
  packageData: function () {
    let packageData = ReactionCore.Collections.Packages.findOne({
      name: "reaction-p2p-marketplace"
    });
    return packageData;
  }
});

Template.braintree.events({
  "click [data-event-action=showMarketplaceSettings]": function () {
    ReactionCore.showActionView();
  }
});

AutoForm.hooks({
  "marketplace-update-form": {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Marketplace settings saved.", "success");
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Marketplace settings update failed. " + error, "danger");
    }
  }
});
