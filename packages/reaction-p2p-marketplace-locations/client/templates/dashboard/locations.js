Template.locationsSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      // name: 'reaction-locations'
      name: "reaction-p2p-marketplace-locations"
    });
  },

  checkboxAtts: function () {
    return {
      class: "checkbox-switch"
    }
  }
});


AutoForm.hooks({
  "locations-update-form": {
    onSuccess: function(operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Locations settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Locations settings update failed. " + error, "danger");
    }
  }
});
