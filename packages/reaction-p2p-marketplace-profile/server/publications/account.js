/**
 * product detail publication
 * @param {String} productId - productId or handle
 * @return {Object} return product cursor
 */
Meteor.publish("ProfileAccount", function (userId) {
  check(userId, Match.OptionalOrNull(String));
  if (!userId) {
    ReactionCore.Log.info("ignoring null request on ProfileAccount subscription");
    return this.ready();
  }

  return ReactionCore.Collections.Accounts.find({_id: userId},
    {
      fields:
      {
        _id: 1,
        userId: 1,
        "profile.addressBook.address1": 1,
        "profile.addressBook.address2": 1,
        "profile.addressBook.postal": 1,
        "profile.addressBook.city": 1,
      }
    }
  );
});

Meteor.publish("ProfileUser", function (userId) {
  check(userId, Match.OptionalOrNull(String));
  if (!userId) {
    ReactionCore.Log.info("ignoring null request on ProfileUser subscription");
    return this.ready();
  }

  return Meteor.users.find({_id: userId},
    {
      fields:
      {
        _id: 1,
        userId: 1,
        "profile.name": 1,
        "profile.description": 1,
      }
    }
  );
});
