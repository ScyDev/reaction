/* ================================================================================= */
/* Connect collection data manipulation into template instance */

this.initializeViewData = (templateInstance, publication, filtersAccessor, initialLimit = 24) => {
  if (!templateInstance || !publication) return;
  templateInstance.publication = publication;
  templateInstance.filtersAccessor = filtersAccessor || publication;
  filtersAccessor = templateInstance.filtersAccessor;

  templateInstance.dataLoaded = new ReactiveVar(false);
  templateInstance.loadingMoreData = new ReactiveVar(false);
  templateInstance.scrollLimit = new ReactiveVar(initialLimit);

  Session.setDefault(`${filtersAccessor}/selector`, {});
  Session.setDefault(`${filtersAccessor}/filters/mealTime`, { showLunch: true, showDinner: true });
  Session.setDefault(`${filtersAccessor}/filters/tags`, Session.get("tags"));

  /* Update product subscription on filters change */
  templateInstance.autorun(() => applyFilters(templateInstance));
}


/* Watch after collection filters stored in Session and resubscribe on changes */
applyFilters = (templateInstance) => {
  const publication = templateInstance.publication;
  const filters = {...ReactionRouter.current().queryParams }

  const tag = ReactionCore.Collections.Tags.findOne({ slug: ReactionRouter.getParam("slug") });

  /* Collect the filters from Session into the 'filters' */
  const filtersAccessor = templateInstance.filtersAccessor;

  filters.tags = tag ? [tag._id] : Session.get(`${filtersAccessor}/filters/tags`) || [];
  if (!filters.tags.length) delete filters.tags;

  filters.forSaleOnDate = Session.get(`${filtersAccessor}/filters/forSaleOnDate`) || "Invalid Date";
  if (filters.forSaleOnDate.toString() === "Invalid Date") delete filters.forSaleOnDate;

  filters.location = Session.get(`${filtersAccessor}/filters/location`) || "";
  if (filters.location.trim() === "") delete filters.location;

  filters.mealTime = Session.get(`${filtersAccessor}/filters/mealTime`);
  if (!filters.mealTime) delete filters.mealTime;

  filters.query = Session.get(`${filtersAccessor}/filters/query`) || "";
  if (filters.query.trim() === "") delete filters.query;

  const selector = buildProductSelectorByFilters(filters)
  Session.set(`${filtersAccessor}/selector`, selector);

  const limit = templateInstance.scrollLimit.get();

  Tracker.nonreactive(() => templateInstance.dataLoaded.set(templateInstance.loadingMoreData.get()));
  templateInstance.subscription = templateInstance.subscribe(publication, {selector, limit}, () => {
    templateInstance.dataLoaded.set(true);
    templateInstance.loadingMoreData.set(false);
  });
}


const buildProductSelectorByFilters = (filters = {}) => {
  let subselectors = {}

  // filter by tags
  if (filters.tags) subselectors.tags = {
    hashtags: {
      $in: filters.tags,
    }
  };

  // filter by details
  if (filters.details) subselectors.details = {
    metafields: {
      $elemMatch: {
        key: {
          $regex: filters.details.key,
          $options: "i",
        },
        value: {
          $regex: filters.details.value,
          $options: "i",
        }
      }
    }
  };

  // filter by title/description
  if (filters.query) {
    let cond = {
      $regex: filters.query,
      $options: "i",
    };
    subselectors.query = {
      $or: [{
        title: cond
      }, {
        pageTitle: cond
      }, {
        description: cond
      }]
    };
  }

  // filter by location
  if (filters.location) {
    const filterLocation = filters.location.split("/");
    const filterLat = parseFloat(filterLocation[0]);
    const filterLon = parseFloat(filterLocation[1])

    // http://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-a-latitude-longitude-by-some-amount-of-meters
    const oneKilometerLat = 1.0 / 111.111;
    const oneKilometerLon = 1.0 / (111.111 * Math.cos(filterLat));
    const searchDistanceMultiplier = 10;

    subselectors.location = {
      "location.lat": {
        "$gte": filterLat - (oneKilometerLat * searchDistanceMultiplier),
        "$lte": filterLat + (oneKilometerLat * searchDistanceMultiplier),
      },
      "location.lon": {
        "$gte": filterLon + (oneKilometerLon * searchDistanceMultiplier), // ATTENTION!!! for Long, +/- is reversed
        "$lte": filterLon - (oneKilometerLon * searchDistanceMultiplier),
      },
    };
  }

  // filter by meal time
  const filterMealTime = filters.mealTime;
  if (filterMealTime && (!filterMealTime.showLunch || !filterMealTime.showDinner)) subselectors.mealTime = {
    pickupTimeTo: {
      "$gte": filterMealTime.showLunch ? "00:00" : "14:00",
      "$lte": filterMealTime.showDinner ? "24:00" : "14:00",
    }
  };

  // filter by gte minimum price
  if (filters["price.min"])  subselectors.minPrice = {
    "price.min": {
      $gte: parseFloat(filters["price.min"])
    }
  };

  // filter by lte maximum price
  if (filters["price.max"]) subselectors.maxPrice = {
    "price.max": {
      $lte: parseFloat(filters["price.max"])
    }
  };

  // filter by gte minimum weight
  if (filters["weight.min"]) subselectors.minWeight = {
    weight: {
      $gte: parseFloat(filters["weight.min"])
    }
  };

  // filter by lte maximum weight
  if (filters["weight.max"] && !filters["weight.min"]) subselectors.maxWeight = {
    weight: {
      $lte: parseFloat(filters["weight.max"])
    }
  };

  // Filter by sale date if it is explicitly defined in the filters set
  if (filters.forSaleOnDate) {
    const filterDate = moment(filters.forSaleOnDate, "DD.MM.YYYY");
    if (filterDate.toString() !== "Invalid date") subselectors.saleDate = {
      forSaleOnDate: {
        "$gte": new Date(filterDate.startOf("day").format()),
        "$lte": new Date(filterDate.endOf("day").format()),
      }
    };
  }

  let selector = {};
  Object.keys(subselectors).map(k => selector = { ...selector, ...subselectors[k] });
  return selector;
}
