
// overriding CartItem schema with extended version
ReactionCore.Schemas.OrderItem = new SimpleSchema([
  ReactionCore.Schemas.OrderItem,
  {
    sellerId: {
      type: String,
      index: 1,
      optional: true
    },
  }
]);

ReactionCore.Schemas.Order = new SimpleSchema([
  ReactionCore.Schemas.Order,
  {
    items: {
      type: [ReactionCore.Schemas.OrderItem],
      optional: true
    },
  }
]);
