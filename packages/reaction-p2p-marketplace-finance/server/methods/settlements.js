
Meteor.methods({
  "settlements/createSettlementForSeller": function (sellerId) {
    check(sellerId, String);

    //return belongsToCurrentUser(productId);
  },
});
