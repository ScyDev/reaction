
ReactionCore.MethodHooks.after('accounts/addressBookAdd', function(options) {
  ReactionCore.Log.info("ReactionCore.MethodHooks.after('accounts/addressBookAdd') options: ", options);

  let account = ReactionCore.Collections.Accounts.findOne({ _id: Meteor.userId() });
  ReactionCore.Log.info("ReactionCore.MethodHooks.after('accounts/addressBookAdd') account: ", account);
  if (account.profile.addressBook && account.profile.addressBook.length > 0) {
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");
  }

  // To be safe, return the options.result in an after hook.
  return options.result;
});
