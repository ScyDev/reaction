
this.buildProductSelector = (productFilters, userId) => {
  const shopId = ReactionCore.getShopId();
  ReactionCore.Log.info( "Shop:", shopId);
  
  let shopAdmin = false;

  const selector = {
    // Using '$not: {$ne' instead of '$eq'
    // The issue is solved in Meteor 1.3.3: https://github.com/meteor/meteor/issues/4142
    ancestors: { $exists: true, $not: {$ne: [] } },
    shopId
  };

  if (productFilters) {
    if (Roles.userIsInRole(userId, ["admin"])) {
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
        if (Roles.userIsInRole(userId, ["admin", "createProduct"], thisShopId)) {
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

    // filter by sale date
    if (productFilters.forSaleOnDate) {
      let filterDate = new Date(moment(productFilters.forSaleOnDate, "DD.MM.YYYY").format('MM/DD/YYYY'));
			if (filterDate.toString() == "Invalid Date") {
				filterDate = null;
        ReactionCore.Log.info("invalid filter date: ",filterDate);
			}
      else {
        let basicDate = moment(filterDate).format('YYYY-MM-DD');
        ReactionCore.Log.info("filtering products by date: ",basicDate, " ",new Date(basicDate+"T00:00:00.000Z")," ",new Date(basicDate+"T23:59:59.000Z"));

        _.extend(selector, {
          forSaleOnDate: {
            "$gte": new Date(basicDate+"T00:00:00.000Z"),
            "$lte": new Date(basicDate+"T23:59:59.000Z")
          }
        });
      }
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

    // show all seller's products
    if( productFilters.showAllMine && userId) {
      _.extend(selector, { userId });
    } else {
    
      // filter by latest order date
      ReactionCore.Log.info("shopAdmin: ",shopAdmin);
      if (!shopAdmin) {
        // let currentDate = new Date(moment().utcOffset("+02:00").format('MM/DD/YYYY HH:mm')); // Date is necessary, moment won't work for query
        let currentDate = new Date(moment().format('MM/DD/YYYY HH:mm')); // Date is necessary, moment won't work for query
        // let basicDate = new Date(moment().utcOffset("+02:00").format('MM/DD/YYYY'));
        let basicDate = new Date(moment().format('MM/DD/YYYY'));
        ReactionCore.Log.info("filtering products by lastOrderDate:", currentDate);
        ReactionCore.Log.info("and forSaleOnDate:", basicDate);
  
        _.extend(selector, {
          latestOrderDate: {
            "$gte": currentDate
          },
          forSaleOnDate: {
            "$gte": basicDate
          }
        });
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
        const usersForLocation = Meteor.users.find( usersSelector );
  
        const userIds = usersForLocation.map( p => p._id )
        ReactionCore.Log.info("found users for lat/long: ", userIds);
  
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

      // products are always visible to owners and admins
      if (!(Roles.userIsInRole(userId, ["owner"], shopId) || shopAdmin)) {
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
    }
  }

  return selector;
}
