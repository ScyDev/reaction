/**
 * seller orders
 */

Meteor.publish("SellerOrders", function () {
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, ["admin", "owner"], shopId)) {
    return ReactionCore.Collections.Orders.find({
      shopId: shopId
    });
  }
  return ReactionCore.Collections.Orders.find({
    shopId: shopId,
    //"items.item.sellerId": this.userId
    items: {
      $elemMatch: {
           sellerId: this.userId,
      }
    }
  });
});
