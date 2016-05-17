
ReactionCore.Collections.SellerSettlements = new Mongo.Collection("SellerSettlements");
ReactionCore.Collections.SellerSettlements.attachSchema(ReactionCore.Schemas.SellerSettlement);

ReactionCore.Collections.Orders.attachSchema([
  ReactionCore.Schemas.Order,
  ReactionCore.Schemas.OrderItem], {replace: true});
