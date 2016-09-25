/* ================================================================================= */
/* Global helpers */

Template.registerHelper("Session", name => Session.get(name));
Template.registerHelper("TemplateContext", varName => {
  const r = Template.instance()[varName];
  return typeof r !== "undefined" && r !== null && r.constructor.name === "ReactiveVar" ? r.get() : r;
});

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/* Localized month names  - not needed as moment.months() */
Meteor.startup(() => Tracker.autorun(() => {
    const lng = Session.get("language");
    ReactionCore.Locale.language = lng;
    moment.locale(ReactionCore.Locale.language);
}));
// Template.wrapGlobalHelper("monthOptions", results => {
//   results.forEach(o => o.label = i18next.t("app.month" + o.label, o.label))
//   return results;
// });

/**
 * dateFormat
 * @description
 * format an ISO date using Moment.js
 * http://momentjs.com/
 * moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
 * @example {{dateFormat creation_date format="MMMM YYYY"}}
 * @param {String} context - moment context
 * @param {String} block - hash of moment options, ie: format=""
 * @return {Date} return formatted date
 */
Template.registerHelper("dateFormat", function (context, block) {
  let f;
  if (window.moment) {
    f = block.hash.format || "MMM DD, YYYY HH:mm:ss A";
    return moment(context).format(f);
  }
  return context;
});

Template.registerHelper("userIsUndecided",
  function() {
    ReactionCore.Subscriptions.Account = ReactionSubscriptions.subscribe("Accounts", Meteor.userId());
    if (ReactionCore.Subscriptions.Account.ready()) {
      let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
      console.log("userIsUndecided(): Account ",account,Roles.userIsInRole("anonymous"));

      if (Roles.userIsInRole(Meteor.userId(), "anonymous", ReactionCore.getShopId())) {
        console.log("userIsUndecided(): false because anonymous");
        return false; // not really decided, but we don't wanna force guest user to decide
      }
      else if (account.isDecided === true) {
        console.log("userIsUndecided(): false because decided");
        return false;
      }

      console.log("userIsUndecided(): true");
      return true;
    }

    console.log("userIsUndecided(): false because Accounts sub not ready");
    return false;
  }
);

Template.registerHelper("redirectToAddressEntry",
  function() {
    if (!Blaze._globalHelpers.isLoggedIn(false)) {
      return false;
    }
    if (ReactionRouter.current().route.name == "account/profile") {
      return false;
    }

    ReactionCore.Subscriptions.Account = ReactionSubscriptions.subscribe("Accounts", Meteor.userId());
    if (ReactionCore.Subscriptions.Account.ready()) {
      console.log("snaxterLayout.js: Account sub ready");
      let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
      //let account = ReactionCore.Collections.Accounts.findOne(Meteor.userId());
      console.log("userHasAddress: ",account);
      if (account == null) {
        return false;
      }

      if (account != null
        && account.profile != null
        && account.profile.addressBook != null
        && account.profile.addressBook.length > 0) {
        return false;
      }
      else {
        /*
         Alerts.alert(
         {
         title: i18next.t("accountsUI.error.noAddress", "No address"),
         text: i18next.t("accountsUI.error.youNeedToEnterYourAddress", "You need to enter your address."),
         type: "info",
         },
         function() {
         //ReactionRouter.go("/account/profile");
         //window.location.href = "/snaxter/account/profile";
         }
         );*/
        return true;
      }
    }

  }
);
