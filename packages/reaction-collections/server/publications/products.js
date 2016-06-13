//
// define search filters as a schema so we can validate
// params supplied to the products publication
//
const filters = new SimpleSchema({
  "shops": {
    type: [String],
    optional: true
  },
  "tags": {
    type: [String],
    optional: true
  },
  "forSaleOnDate": {
    type: String,
    optional: true
  },
  "location": {
    type: String,
    optional: true
  },
  "query": {
    type: String,
    optional: true
  },
  "visibility": {
    type: Boolean,
    optional: true
  },
  "details": {
    type: Object,
    optional: true
  },
  "details.key": {
    type: String,
    optional: true
  },
  "details.value": {
    type: String,
    optional: true
  },
  "mealTime": {
    type: Object,
    optional: true
  },
  "price": {
    type: Object,
    optional: true
  },
  "price.min": {
    type: String,
    optional: true
  },
  "price.max": {
    type: String,
    optional: true
  },
  "weight": {
    type: Object,
    optional: true
  },
  "weight.min": {
    type: String,
    optional: true
  },
  "weight.max": {
    type: String,
    optional: true
  }
});

/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 24
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit = 24, productFilters, sort = {}) {
  console.log("Products publication call!");
  
  check(productScrollLimit, Number);
  check(productFilters, Match.OneOf(undefined, filters, String, Object));

  const shop = ReactionCore.getCurrentShop();

  if (typeof shop !== "object") return this.ready();

  const selector = buildProductSelector(productFilters, this.userId);
  
  // default sort
  if (_.isEmpty(sort)) sort = { latestOrderDate: 1 }

  /* simulating long loading publication */
  //Meteor._sleepForMs(2000);
  /* or call a function that doesn't exist, simulating never loading pub */
  //Meteor.asdflol(2000);

  ReactionCore.Log.info( "Query:", selector, sort )
  const products = ReactionCore.Collections.Products.find(selector, {
    sort: sort,
    limit: productScrollLimit
  });
  ReactionCore.Log.info("Products publication:", products.count(), "items returned.");
  return products;
});
