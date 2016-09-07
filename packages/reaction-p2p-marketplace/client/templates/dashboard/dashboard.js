/* Replacing the original 'members' helper. The current package is alphabetically after the original 'reaction-accounts' */
Template.accountsDashboard.helpers({
  /**
   * members
   * @return {Boolean} True array of adminsitrative members
   */
  members: function () {
    if (ReactionCore.hasPermission("reaction-accounts")) {
      const shopId = ReactionCore.getShopId();
      const instance = Template.instance();
      if (instance.subscriptionsReady()) {
        const shopUsers = Meteor.users.find();

        return shopUsers.map(user => {
          let member = {};

          member.userId = user._id;

          if (user.emails && user.emails.length) {
            // this is some kind of denormalization. It is helpful to have both
            // of this string and array. Array goes to avatar, string goes to
            // template
            member.emails = user.emails;
            member.email = user.emails[0].address;
          }
          // member.user = user;
          member.username = user.username;
          member.isAdmin = Roles.userIsInRole(user._id, "admin", shopId);
          member.roles = user.roles;
          member.services = user.services;

          if (Roles.userIsInRole(member.userId, "dashboard", shopId)) {
            member.role = "dashboard";
          }

          if (Roles.userIsInRole(member.userId, "admin", shopId)) {
            member.role = "admin";
          }

          if (Roles.userIsInRole(member.userId, "owner", shopId)) {
            member.role = "owner";
          }
          else if (Roles.userIsInRole(member.userId, "guest", shopId)) {
            let account = ReactionCore.Collections.Accounts.findOne({_id: user._id || user.userId});

            member.role = "guest";
            if (user.profile != null) {
              member.profileName = user.profile.name;
            }
            if (account && account.isSeller) { member.isSeller = "Seller" } else { member.isSeller = "Buyer" };

            if (account) {
              member.createdAt = account.createdAt;
              if (account.profile.addressBook && account.profile.addressBook.length > 0)
                member.address = account.profile.addressBook[0];
            }
            // console.log("account.isSeller:", member.isSeller);
          }

          return member;
        });
      }
    }
  }
});
