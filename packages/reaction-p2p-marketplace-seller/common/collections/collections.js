/**
* Collections Templates
*/

// overriding Products collection set by reaction core
ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.Product, {selector: { type: "simple" }, replace: true});

ReactionCore.Collections.Accounts.attachSchema(ReactionCore.Schemas.Accounts, {replace: true});

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.Cart, {replace: true});

ReactionCore.Collections.Orders.attachSchema([ReactionCore.Schemas.Cart,
  ReactionCore.Schemas.Order,
  ReactionCore.Schemas.OrderItem], {replace: true});
