Meteor.methods(
  {
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
  }
);
