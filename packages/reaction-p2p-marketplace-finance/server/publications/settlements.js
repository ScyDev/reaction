
Meteor.publish("SellerTransactions", function () {
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, ["admin", "owner"], shopId)) {
    return ReactionCore.Collections.SellerTransactions.find({
      shopId: shopId
    });
  }
  return ReactionCore.Collections.SellerTransactions.find({
    shopId: shopId,
    //"items.item.sellerId": this.userId
    sellerId: this.userId,
  });
});
