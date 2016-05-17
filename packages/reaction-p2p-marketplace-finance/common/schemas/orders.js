
// overriding CartItem schema with extended version
ReactionCore.Schemas.OrderItem = new SimpleSchema([
  ReactionCore.Schemas.OrderItem,
  {
    settledWithSeller: {
      type: Boolean,
      index: 1,
      optional: true,
      defaultValue: false,
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
