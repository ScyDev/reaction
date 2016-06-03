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
  // console.log(productFilters)
  check(productScrollLimit, Number);
  check(productFilters, Match.OneOf(undefined, filters, String, Object));

  let shopAdmin;
  const shop = ReactionCore.getCurrentShop();
  const Products = ReactionCore.Collections.Products;

  if (typeof shop !== "object") {
    return this.ready();
  }

  if (shop) {
    let selector = {
      ancestors: { $exists: true, $eq: [] },
      shopId: shop._id
    };

    if (productFilters) {
      if (Roles.userIsInRole(this.userId, ["admin"])) {
        shopAdmin = true;
      }

      // handle multiple shops
      if (productFilters.shops) {
        _.extend(selector, {
          shopId: {
            $in: productFilters.shops
          }
        });

        // check if this user is a shopAdmin
        for (let thisShopId of productFilters.shops) {
          if (Roles.userIsInRole(this.userId, ["admin", "createProduct"], thisShopId)) {
            shopAdmin = true;
          }
        }
      }

      // filter by tags
      if (productFilters.tags) {
        _.extend(selector, {
          hashtags: {
            $in: productFilters.tags
          }
        });
      }

      // default sort
      if (_.isEmpty(sort)) {
        sort = {
          latestOrderDate: 1
        }
        ReactionCore.Log.info("sort by: ",sort);
      }

      // filter by latest order date
      ReactionCore.Log.info("shopAdmin: ",shopAdmin);
      if (!shopAdmin) {
        // let currentDate = new Date(moment().utcOffset("+02:00").format('MM/DD/YYYY HH:mm')); // Date is necessary, moment won't work for query
        let currentDate = new Date(moment().format('MM/DD/YYYY HH:mm')); // Date is necessary, moment won't work for query
        // let basicDate = new Date(moment().utcOffset("+02:00").format('MM/DD/YYYY'));
        let basicDate = new Date(moment().format('MM/DD/YYYY'));
        ReactionCore.Log.info("default filtering products by lastOrderDate: ",currentDate);
        ReactionCore.Log.info("default filtering and forSaleOnDate: ",basicDate);

        _.extend(selector, {
          latestOrderDate: {
            "$gte": currentDate
          },
          forSaleOnDate: {
            "$gte": basicDate
          }
        });
      }

      // filter by sale date
      if (productFilters.forSaleOnDate) {
        ReactionCore.Log.info("filtering by specific forSaleOnDate: ",productFilters.forSaleOnDate);

        let filterDate = moment(productFilters.forSaleOnDate, "DD.MM.YYYY").format('MM/DD/YYYY');
				if (filterDate.toString() == "Invalid Date") {
					filterDate = null;
          ReactionCore.Log.info("invalid filter date: ",filterDate);
				}
        else {
          let basicDate = moment(filterDate).format('YYYY-MM-DD');
          ReactionCore.Log.info("filtering products by date: ",basicDate, " ",moment(basicDate).startOf("day").format()," ",moment(basicDate).endOf("day").format());

          _.extend(selector, {
            forSaleOnDate: {
              "$gte": new Date(moment(basicDate).startOf("day").format()),
              "$lte": new Date(moment(basicDate).endOf("day").format())
            }
          });
        }
      }

      // filter by location
      if (productFilters.location) {
        ReactionCore.Log.info("filtering products by location: ",productFilters.location);
        let filterLocation = productFilters.location.split("/");
        let filterLat = parseFloat(filterLocation[0]);
        let filterLong = parseFloat(filterLocation[1])

        // http://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-a-latitude-longitude-by-some-amount-of-meters
        let oneKilometerLat = 1.0/111.111;
        let oneKilometerLong = 1.0/(111.111 * Math.cos(filterLat));
        let searchDistanceMultiplier = 10;

        let usersSelector = {
          "profile.latitude": {
            "$gte": filterLat - (oneKilometerLat * searchDistanceMultiplier),
            "$lte": filterLat + (oneKilometerLat * searchDistanceMultiplier),
          },
          "profile.longitude": {
            "$gte": filterLong + (oneKilometerLong * searchDistanceMultiplier), // ATTENTION!!! for Long, +/- is reversed
            "$lte": filterLong - (oneKilometerLong * searchDistanceMultiplier),
          },
        };
        ReactionCore.Log.info("with selector: ",usersSelector);
        let usersForLocation = Meteor.users.find(
          usersSelector
        );

        let userIds = usersForLocation.map(function(p)
          {
            ReactionCore.Log.info("map user: ",p);
            return p._id
          }
        );
        ReactionCore.Log.info("found users for lat/long: ",userIds);

        _.extend(selector, {
          userId: {
            "$in": userIds,
          }
        });
      }

      // filter by meal time
      const filterMealTime = productFilters.mealTime;
      if (filterMealTime && (!filterMealTime.showLunch || !filterMealTime.showDinner)) {
        ReactionCore.Log.info("filtering products by meal time: ", filterMealTime);

        _.extend(selector, {
          pickupTimeTo: {
            "$gte": filterMealTime.showLunch ? "00:00" : "14:00",
            "$lte": filterMealTime.showDinner ? "24:00" : "14:00"
          }
        });
      }

      // filter by query
      if (productFilters.query) {
        let cond = {
          $regex: productFilters.query,
          $options: "i"
        };
        _.extend(selector, {
          $or: [{
            title: cond
          }, {
            pageTitle: cond
          }, {
            description: cond
          }]
        });
      }

      // filter by details
      if (productFilters.details) {
        _.extend(selector, {
          metafields: {
            $elemMatch: {
              key: {
                $regex: productFilters.details.key,
                $options: "i"
              },
              value: {
                $regex: productFilters.details.value,
                $options: "i"
              }
            }
          }
        });
      }

      // filter by visibility
      if (productFilters.visibility !== undefined) {
        _.extend(selector, {
          isVisible: productFilters.visibility
        });
      }

      // filter by gte minimum price
      if (productFilters["price.min"] && !productFilters["price.max"]) {
        _.extend(selector, {
          "price.min": {
            $gte: parseFloat(productFilters["price.min"])
          }
        });
      }

      // filter by lte maximum price
      if (productFilters["price.max"] && !productFilters["price.min"]) {
        _.extend(selector, {
          "price.max": {
            $lte: parseFloat(productFilters["price.max"])
          }
        });
      }

      // filter with a price range
      if (productFilters["price.min"] && productFilters["price.max"]) {
        _.extend(selector, {
          $and: [ {
            "price.max": { $lte: parseFloat(productFilters["price.max"])}
          }, {
            "price.min": { $gte: parseFloat(productFilters["price.min"])}
          }]
        });
      }

      // filter by gte minimum weight
      if (productFilters["weight.min"] && !productFilters["weight.max"]) {
        _.extend(selector, {
          weight: {
            $gte: parseFloat(productFilters["weight.min"])
          }
        });
      }

      // filter by lte maximum weight
      if (productFilters["weight.max"] && !productFilters["weight.min"]) {
        _.extend(selector, {
          weight: {
            $lte: parseFloat(productFilters["weight.max"])
          }
        });
      }

      // filter with a weight range
      if (productFilters["weight.min"] && productFilters["weight.max"]) {
        _.extend(selector, {
          $and: [ {
            "weight.max": { $lte: parseFloat(productFilters["weight.max"])}
          }, {
            "weight.min": { $gte: parseFloat(productFilters["weight.min"])}
          }]
        });
      }
    }

    // products are always visible to owners and admins
    if (!(Roles.userIsInRole(this.userId, ["owner"], shop._id) || shopAdmin)) {
      selector.isVisible = true;
      // only products enabled by their owner
      selector.isActive = true;
    }


    // check quantity
    _.extend(selector, {
      isSoldOut: false
    });
    /*
    _.extend(selector, {
      "inventoryQuantity": {
        $gte: 0
      }
    });*/

    /* simulating long loading publication */
    //Meteor._sleepForMs(2000);
    /* or call a function that doesn't exist, simulating never loading pub */
    //Meteor.asdflol(2000);

    console.log( "Query:", selector, sort )

    return Products.find(selector, {
      sort: sort,
      limit: productScrollLimit
    });
  }
});
