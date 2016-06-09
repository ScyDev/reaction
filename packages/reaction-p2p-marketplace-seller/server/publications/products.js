
// /**
// * products publication
// * @param {Number} productScrollLimit - optional, defaults to 24
// * @param {Array} shops - array of shopId to retrieve product from.
// * @return {Object} return product cursor
// */
// Meteor.publish("SellerProducts", function (userId) {
//   check(userId, String);

//   let shopAdmin;
//   const shop = ReactionCore.getCurrentShop();
//   const Products = ReactionCore.Collections.Products;

//   if (typeof shop !== "object") {
//     return this.ready();
//   }

//   if (shop) {
//     let selector = {
//       ancestors: { $exists: true, $eq: [] },
//       shopId: shop._id
//     };

//     _.extend(selector, {
//       userId: userId
//     });

//     let sort = {createdAt: -1};

//     return Products.find(selector, {
//       sort: sort,
//       //limit: productScrollLimit
//     });
//   }
// });
