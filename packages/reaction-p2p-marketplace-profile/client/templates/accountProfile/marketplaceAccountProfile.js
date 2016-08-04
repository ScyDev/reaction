/*
Template.marketplaceAccountProfile.inheritsHooksFrom("accountProfile");
Template.marketplaceAccountProfile.inheritsHelpersFrom("accountProfile");
Template.marketplaceAccountProfile.inheritsEventsFrom("accountProfile");
*/
Template.marketplaceAccountProfile.replaces("accountProfile");

Template.accountProfile.clearEventMaps()

Template.accountProfile.onCreated(() => {
  let template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
  template.type = "profileEdit";

  ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory = Meteor.subscribe("ProductsForOrdersHistory");
});

Template.accountProfile.onDestroyed(function() {
  let user = Meteor.users.findOne({_id: Meteor.userId()});
  if (user.emails == null || user.emails.length == 0) {
    Alerts.alert(
      {
        title: i18next.t("accountsUI.error.emailNeeded", "Email is mandatory"),
        text: i18next.t("accountsUI.error.emailNeededText", {defaultValue: "Please enter a valid email address"}),
        type: "error",
      },
      function() {
        // ...
      }
    );
    ReactionRouter.go("account/profile");
  }

  // stop that subscription, because we want it only on this page, not on any other
  if (ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory != null) {
    ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory.stop();
  }
});

// Event handlers are to be specified on the template that we override for indirect template calls.
Template.accountProfile.helpers({
  isProdsSubReady: function() {
    if (ReactionCore.MeteorSubscriptions_ProductsForOrdersHistory.ready()) {
      return true;
    }
    else {
      return false;
    }
  },
  messages: function () {
    return Template.instance().formMessages.get();
  },

  hasError: function(error) {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return "has-error has-feedback";
    }

    return false;
  },

  formErrors: function() {
    return Template.instance().formErrors.get();
  },

  uniqueId: function () {
    return Template.instance().uniqueId;
  },

  services: function() {
    let serviceHelper = new ReactionServiceHelper();
    return serviceHelper.services();
  },

  shouldShowSeperator: function() {
    let serviceHelper = new ReactionServiceHelper();
    let services = serviceHelper.services();
    let enabledServices = _.where(services, {
      enabled: true
    });

    return !!Package["accounts-password"] && enabledServices.length > 0;
  },

  hasPasswordService: function() {
    return !!Package["accounts-password"];
  },

  displayEmail: function() {
    let user = Meteor.users.findOne({_id: Meteor.userId()});
    return user.emails[0].address;
  }
});

Template.accountProfile.events({ // for some strange reason our custom event needs to be speficied on the template that we override. doesn't work with our new template name.
  "submit form#profile-form": function (event, template) {
    console.log("Template.marketplaceAccountProfile.events(submit form#profile-form)");
    event.preventDefault();

    // var usernameInput = template.$(".login-input--username");
    let nameInput = template.$(".profile-input-name");
    let descriptionInput = template.$(".profile-input-description");

    let name = nameInput.val().trim();
    let description = descriptionInput.val().trim();

    let validatedName = ProfileFormValidation.name(name);
    let validatedDescription = ProfileFormValidation.description(description);
    console.log("submit profile form ", name," ",description);
    console.log("submit profile form ", validatedName," ",validatedDescription);
    let templateInstance = Template.instance();
    let errors = {};

    templateInstance.formMessages.set({});

    if (validatedName !== true) {
      errors.name = validatedName.reason;
    }
    if (validatedDescription !== true) {
      errors.description = validatedDescription.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent signup
      return;
    }

    let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
    let user = Meteor.users.findOne({_id: Meteor.userId()});

    Meteor.users.update(
      {
        _id: Meteor.userId() // from client, updates always need to reference _id
      },
      {
        $set: {
          "profile.name": name,
          "profile.description": description
        }
      }
    );

    console.log("updated profile info ");

  },

  "submit form#email-form": function (event, template) {
    console.log("Template.marketplaceAccountProfile.events(submit form#email-form)");
    event.preventDefault();

    let emailInput = template.$(".profile-input-email");

    let email = emailInput.val().trim();

    let validatedEmail = ProfileFormValidation.email(email);
    console.log("submit email form ", email);
    console.log("submit email form ", validatedEmail);
    let templateInstance = Template.instance();
    let errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true) {
      errors.email = validatedEmail.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent signup
      return;
    }

    Meteor.call("accounts/updateEmailAddress", Meteor.userId(), email);

    console.log("updated email info ");

  },

  "click #passwordChangeButton": function (event, template) {
    $('#passwordChangeContainer').fadeIn();
    $('#passwordChangeButton').hide();
  }
});


/* Fetch new coordinates when seller's address is changed within the profile */
AutoForm.hooks({ addressBookEditForm: {
  onSubmit: function (address) {
    this.event.preventDefault();

    const addressStr = (address.address1 + " " + address.address2 + ", " + address.postal + " " + address.city
                        + ", " + address.country)
                       .replace("undefined", "").replace(/\s+/g, " ").replace(/\s+,/g, " ");
    console.log("YAHOO!", address, addressStr);

    GoogleMaps.load({ key: getGoogleMapsApiKey() });
    Tracker.autorun(c => {
      if (!GoogleMaps.loaded()) return;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: addressStr }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          const { location } = results[0].geometry;
          Meteor.users.update({ _id: Meteor.userId() }, {
            $set: {
              "profile.latitude": location.lat(),
              "profile.longitude": location.lng(),
            }
          });
          console.log("updated profile lat/lng");
        }
      });
      c.stop();
    });
  }
}});


