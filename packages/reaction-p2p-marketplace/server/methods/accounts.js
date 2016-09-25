ReactionCore.Hooks.Events.add(
  "onCreateUser",
  function(user, options) {
    ReactionCore.Log.info("ReactionCore.Hooks.Events -> onCreateUser options: "+options);

    // doing this not only for sellers. buyers have a name on their profile too.
    user.profile = options.profile;
    if (user.profile != null) {
      user.profile.isDecided = false; // to force decision between buyer and seller
    }

    return user;
  }
);

Meteor.methods({
  "accounts/getUserNameAddressPhone": function (userId) {
    check(userId, String);

    let account =  ReactionCore.Collections.Accounts.findOne({userId: userId});
    //ReactionCore.Log.info("getUserNameAddressPhone: ",account);

    if (account != null && account.profile.addressBook != null && account.profile.addressBook.length > 0) {
      let address = account.profile.addressBook[0];
      let addressString = address.fullName + ", " + address.address1+" "+address.address2+", "+address.postal+" "+address.city+", "+address.phone

      //ReactionCore.Log.info("User name address string: ",addressString);
      return addressString;
    }

    return null;
  },
  "accounts/userDecide": function (isSeller, acceptedTerms) {
    check(isSeller, Boolean);
    check(acceptedTerms, Boolean);

    let user = Meteor.user();
    ReactionCore.Log.info("Meteor.methods.accounts/userDecide() user: ",user," isSeller: ",isSeller);

    if (acceptedTerms) {
      const shop = ReactionCore.getCurrentShop();
      const shopId = shop._id;

      if (isSeller) {
        ReactionCore.Log.info("Adding seller permissions.");
        user.roles[shopId].push("createProduct");
        user.roles[shopId].push("account/seller/products"); // for access to our own products route
        user.roles[shopId].push("account/seller/sellerorders"); // for access to our own orders route
      }

      Meteor.users.update(Meteor.userId(),
        { "$set": { "roles": user.roles } }
      );

      ReactionCore.Collections.Accounts.update(Meteor.userId(),
        {
          "$set": {
            isSeller: isSeller,
            acceptedTerms: acceptedTerms,
            isDecided: true
          }
        }
      );

      //ReactionCore.Log.info("Meteor.methods.accounts/userDecide() user after update: ",Meteor.user());
      return {isSeller: isSeller, acceptedTerms: acceptedTerms};
    }
    else {
      ReactionCore.Log.info("Meteor.methods.accounts/userDecide() Terms not accepted! ");
      throw new Meteor.Error(403, "Access Denied");
    }
  },
});
