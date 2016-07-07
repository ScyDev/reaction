/* watch for productFilters in Session and resubscribe */

let savedProductFilters;
let savedProductQueryParams = {};
let savedProductScrollLimit = 0;
const productsSubReady = new ReactiveVar(false);
const loadingMoreProducts = new ReactiveVar(false);

this.applyProductFilters = () => {
  const route = ReactionRouter._current.path;

  /* Collect the filters from Session into the 'queryParams' */

  const showAllMine = /\/account\/seller\/products/.test(route);
  const showAllMineFilter = showAllMine ? { showAllMine: true } : {};

  const slug = ReactionRouter.getParam("slug");
  const { Tags } = ReactionCore.Collections;
  const tag = Tags.findOne({ slug: slug }) || Tags.findOne(slug);

  let tagsFilter = tag ? { tags: [tag._id] } : ( showAllMine ? { tags: Session.get("productFilters/tags") } : {} );
  if ((tagsFilter.tags == null || tagsFilter.tags.length == 0) && !showAllMine) tagsFilter = {};

  let dateFilter = { forSaleOnDate: Session.get("productFilters/forSaleOnDate") };
  if (dateFilter.forSaleOnDate == null || dateFilter.forSaleOnDate.toString() == "Invalid Date") dateFilter = {};

  let locationFilter = { location: Session.get("productFilters/location") };
  if (locationFilter.location == null || locationFilter.location.trim() == "") locationFilter = {};

  const mealTimeFilter = { mealTime: Session.get("productFilters/mealTime") };

  let queryFilter = { query: Session.get("productFilters/query") };
  if (queryFilter.query == null || queryFilter.query === "") queryFilter = {};

  const queryParams = Object.assign({}, tagsFilter, ReactionRouter.current().queryParams, dateFilter, locationFilter, mealTimeFilter, showAllMineFilter, queryFilter, {userId: Meteor.userId()});

  const productScrollLimit = Session.get("productScrollLimit");

  /* We do not check route earlier as the Tracker ignores reactive vars after the "return" statement */
  if (typeof route === "undefined") {
    console.log("Route is not defined yet...");
    return;
  }

  /* Here we wrap the code into Tracker.nonreactive not to allow Tracker to stop the sub automatically,
     because it is doing that even when the condition is not fulfilled and the next resubscription is not called.
     In the result we had not ready subscriptions in some cases.
  */
  const queryParamsDifferFromPrevious = !_.isEqual(queryParams, savedProductQueryParams);
  if (queryParamsDifferFromPrevious || productScrollLimit != savedProductScrollLimit) Tracker.nonreactive(() => {
    if (queryParamsDifferFromPrevious) productsSubReady.set(false);
    else loadingMoreProducts.set(true);
    savedProductQueryParams = queryParams;
    savedProductScrollLimit = productScrollLimit;
    console.info("applyProductFilters | queryParams:", queryParams);

    /* We need to build the Products fetch selector to compare it with the previous one,
     however we can do it on server only as the location filter is Users collection dependant
     */
    Meteor.call("buildProductSelector", queryParams, Meteor.userId(), (error, productFilters) => {
      /* IMPORTANT: When we get error here, the filter will be wrong until the next (successful) method call */
      if (!error) Session.set("productFilters", productFilters);
    });

    /* As the subscription is not stopped automatically, we should stop it manually,
       but only after the next subscription is ready.
       At the same time using 'Meteor.subscribe' instead of 'SubsManager.subscribe' allows us
       to catch 'remove' events correctly when the subscription is stopped.
    */
    const oldSub = ReactionCore.Subscriptions.Products;
    ReactionCore.Subscriptions.Products = Meteor.subscribe("Products", productScrollLimit, queryParams, () => {
      if (oldSub) oldSub.stop();
      productsSubReady.set(true);
      loadingMoreProducts.set(false);
      console.log("ReactionCore.Subscriptions.Products is ready.");
    });
  }); else {
    console.info("Tracker pushed with the same environment state, ignoring...");
  }
}


Meteor.startup(() => {
  Session.set("productFilters", {});
  Session.set("productFilters/showAllMine", false);
  Session.setDefault("productFilters/mealTime", { showLunch: true, showDinner: true });
  Session.set("productScrollLimit", 24);

  Tracker.autorun(() => {
    if (!ReactionCore.Subscriptions.Tags.ready()) return;
    const tags = ReactionCore.Collections.Tags.find().fetch().map(tag =>  tag._id);
    tags.push(null);
    Session.set("productFilters/tags", tags);
  })

  Tracker.autorun(() => {
    /* Watch for route change and set 'show all my products' to true in case of '/account/seller/products' path */
    ReactionRouter.watchPathChange();
    Session.set("productFilters/showAllMine", /\/account\/seller\/products/.test(ReactionRouter._current.path));
  });

  // Update product subscription
  Tracker.autorun(() => applyProductFilters());
});


Template.registerHelper("Session", name => Session.get(name));
Template.registerHelper("isProdsSubReady", () => productsSubReady.get());
Template.registerHelper("loadingMoreProducts", () => loadingMoreProducts.get());
