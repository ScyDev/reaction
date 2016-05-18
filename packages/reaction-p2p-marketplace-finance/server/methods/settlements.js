
Meteor.methods({
  "settlements/createSettlementForSeller": function (sellerId) {
    check(sellerId, String);

    if (ReactionCore.hasAdminAccess()) {
      let unsettledOrderItems = ReactionCore.Collections.Orders.find(
        {
          "items.sellerId": sellerId,
          "items.settledWithSeller": false
        }
      ).fetch();

      ReactionCore.Log.info("Meteor.methods.settlements/createSettlementForSeller", sellerId, unsettledOrderItems);
    }
  },
});
