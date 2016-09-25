
// overriding CartItem schema with extended version
ReactionCore.Schemas.CartItem = new SimpleSchema([
  ReactionCore.Schemas.CartItem,
  {
    sellerId: {
      type: String,
      index: 1,
      optional: true
    },
  }
]);

ReactionCore.Schemas.CartItems = new SimpleSchema({
  items: {
    type: [ReactionCore.Schemas.CartItem],
    optional: true
  }
});

ReactionCore.Schemas.Cart = new SimpleSchema([
  ReactionCore.Schemas.Cart,
  {
    items: {
      type: [ReactionCore.Schemas.CartItem],
      optional: true
    },
  }
]);
