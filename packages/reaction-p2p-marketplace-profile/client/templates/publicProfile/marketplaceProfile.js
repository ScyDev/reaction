Template.marketplaceProfile.onCreated(function () {
  this.userId = () => ReactionRouter.getParam("userId");
  /*
  this.autorun(() => {
    this.subscribe("Product", this.productId());
    this.subscribe("Tags");
  });
  */
});

Template.marketplaceProfile.helpers(
  {
    getProfileAccount: function(userId) {
      //console.log("profileAccount: userId",userId);
      const instance = Template.instance();
      if (instance.userId()) {
        //console.log("profileAccount: instance.userId()",instance.userId());
        userId = instance.userId();
      }
      ReactionCore.Subscriptions.ProfileAccount = ReactionSubscriptions.subscribe("ProfileAccount", userId);
      if (ReactionCore.Subscriptions.ProfileAccount.ready()) {
        let profileAccount = ReactionCore.Collections.Accounts.findOne({_id: userId});
        //console.log("profileAccount: %o",profileAccount);

        return {profileAccount: profileAccount};
      }
    },
    getProfileUser: function(userId) {
      //console.log("getProfileUser: userId",userId);
      const instance = Template.instance();
      if (instance.userId()) {
        //console.log("getProfileUser: instance.userId()",instance.userId());
        userId = instance.userId();
      }
      ReactionCore.Subscriptions.ProfileUser = ReactionSubscriptions.subscribe("ProfileUser", userId);
      if (ReactionCore.Subscriptions.ProfileUser.ready()) {
        let profileUser = Meteor.users.findOne({_id: userId});
        //console.log("profileUser: %o",profileUser);

        return profileUser;
      }
    },

  }
);

/*
Template.registerHelper("getProfileUrl", function (userId) {
  const instance = Template.instance();
  if (instance.subscriptionsReady()) {
    console.log("Template.registerHelper(getProfileUrl) ",userId);
    return "profile/"+userId;
  }
});*/
