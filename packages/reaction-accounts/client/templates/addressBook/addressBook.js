/*
 * Template.checkoutAddressBook
 * template determines which view should be used:
 * addAddress (edit or add)
 * addressBookView (view)
 */

Template.addressBook.onCreated(function () {
  this.currentViewTemplate = ReactiveVar("addressBookAdd");
  this.templateData = ReactiveVar({});

  ReactionSubscriptions.clear();
  ReactionCore.Subscriptions.Account = ReactionSubscriptions.subscribe("Accounts", Meteor.userId());
  console.log("addressBook.js: sub ready? ",ReactionCore.Subscriptions.Account.ready());

  this.autorun(() => {
    // because sometimes subscription seems to be missing or filtered wrong, current users account just can't be loaded
    if (ReactionCore.Subscriptions.Account.ready()) {
      console.log("addressBook.js: Account sub ready");
      let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
      console.log("addressBook.js: account for ",Meteor.userId()," ",account);

      if (account) {
        if (account.profile) {
          if (account.profile.addressBook) {
            if (account.profile.addressBook.length === 0) {
              console.log("addressBook.js: this.currentViewTemplate.set('addressBookAdd')");
              this.currentViewTemplate.set("addressBookAdd");
            } else {
              console.log("addressBook.js: this.currentViewTemplate.set('addressBookGrid')");
              this.currentViewTemplate.set("addressBookGrid");
            }
          }
        }
      }
    }
  });
});

// Template.addressBook.onRendered(function () {
//   let view = this.$("[blaze-view="addressBook"]").get(0);
// });

Template.addressBook.helpers({
  account: function () {
    let account = ReactionCore.Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
    return account;
  },

  data: function () {
    return Template.instance().templateData.get();
  },

  currentView: function () {
    return Template.instance().currentViewTemplate.get();
  },

  selectedAddress: function () {
    return Template.instance.templateData.get();
  }
});

Template.addressBook.events({

  // **************************************************************************
  //
  //
  "click [data-event-action=addNewAddress]": function (event) {
    event.preventDefault();
    event.stopPropagation();

    Template.instance().currentViewTemplate.set("addressBookAdd");
  },

  // **************************************************************************
  // Edit an address
  //
  "click [data-event-action=editAddress]": function (event) {
    event.preventDefault();
    event.stopPropagation();

    Template.instance().templateData.set({
      address: this
    });

    Template.instance().currentViewTemplate.set("addressBookEdit");
  },

  // **************************************************************************
  // Remove the address from the address book
  //
  "click [data-event-action=removeAddress]": function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    Meteor.call("accounts/addressBookRemove", this._id, (error, result) => {
      if (error) {
        Alerts.toast(`Can't remove this address: ${error.message}`, "error");
      }
      if (result) {
        let account = ReactionCore.Collections.Accounts.findOne({
          userId: Meteor.userId()
        });
        if (account) {
          if (account.profile) {
            if (account.profile.addressBook.length === 0) {
              template.currentViewTemplate.set("addressBookAdd");
            }
          }
        }
      }
    });
  },

  "click [data-event-action=cancelAddressEdit], form submit, showMainView": function (event) {
    console.log("fired: click [data-event-action=cancelAddressEdit], form submit, showMainView");
    event.preventDefault();
    event.stopPropagation();

    Template.instance().currentViewTemplate.set("addressBookGrid"); // replaces address form with address grid
    console.log('Template.instance().currentViewTemplate.set("addressBookGrid");');
  }
});
