
ReactionCore.Hooks.Events.add(
  "onCreateUser",
  function(user, options) {
    ReactionCore.Log.info("ReactionCore.Hooks.Events -> onCreateUser options: "+options);
    const shop = ReactionCore.getCurrentShop();
    const shopId = shop._id;

    ReactionCore.Log.info("Adding profile permissions.");

    user.roles[shopId].push("/profile/:userId");
    user.roles[shopId].push("marketplaceProfile"); // this seems to work while the above does not if main path (shop name) is something different than /reaction ?

    return user;
  }
);

Meteor.methods(
  {
    "accounts/updateEmailAddress": function (userId, emailAddress) {
      check(userId, Match.Optional(String, null));
      check(emailAddress, Match.Optional(String, null));

      if (userId == Meteor.userId()) {
        let user = Meteor.users.findOne({_id: userId});
        let account =  ReactionCore.Collections.Accounts.findOne({userId: userId});

        let emails = user.emails;
        ReactionCore.Log.info("Meteor.methods(accounts/updateEmailAddress) existing emails for user ",userId," ",emails);

        if (emails && emails.length > 0) {
          emails[0].address = emailAddress;
        }
        else {
          emails = Array();
          emails[0] = {
            "provides" : "default",
            "address" : emailAddress,
            "verified" : false
          };
        }
        ReactionCore.Log.info("Meteor.methods(accounts/updateEmailAddress) update emails to",emails);

        Meteor.users.update(
          {
            _id: Meteor.userId(),
          },
          {
            $set: {
              emails: emails
            }
          }
        );
        ReactionCore.Log.info("Meteor.methods(accounts/updateEmailAddress) updated emails on user");

        ReactionCore.Collections.Accounts.update(
          {
            _id: Meteor.userId(),
          },
          {
            $set: {
              emails: emails
            }
          }
        );
        ReactionCore.Log.info("Meteor.methods(accounts/updateEmailAddress) updated emails on Account");

        return true;
      }

      return false;
    },
  }
);
