/* watch for productFilters in Session and resubscribe */

Meteor.startup( () => {
  Session.set( "productFilters", {} );
  // Session.setDefault( "productFilters/tags", [] );
  Session.set( "productFilters/showAllMine", false );
	Session.setDefault( "productFilters/mealTime", { showLunch: true, showDinner: true } );
	
	Tracker.autorun(() => {
	  if(!ReactionCore.Subscriptions.Tags.ready()) return;
    const tags = ReactionCore.Collections.Tags.find().fetch().map(tag =>  tag._id);
    tags.push( null );
    Session.set( "productFilters/tags", tags );
	})
	
	Tracker.autorun(() => {
	  ReactionRouter.watchPathChange();
	  Session.set("productFilters/showAllMine", /\/account\/seller\/products/.test(ReactionRouter._current.path) );
	});
});

this.applyProductFilters = () => {
  const showAllMine = Session.get("productFilters/showAllMine");
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
  if (queryFilter.query == null || queryFilter.query == "") queryFilter = {};
  
  const queryParams = Object.assign({}, tagsFilter, ReactionRouter.current().queryParams, dateFilter, locationFilter, mealTimeFilter, showAllMineFilter, queryFilter);
  console.log( "applyProductFilters | queryParams:", queryParams );
  Session.set("productFilters", buildProductSelector(queryParams, Meteor.userId()));
  ReactionCore.MeteorSubscriptions_Products = Meteor.subscribe("Products", Session.get("productScrollLimit"), queryParams);
}

Template.registerHelper("Session", name => Session.get(name));
