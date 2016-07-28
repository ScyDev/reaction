/* Publish into the different client-side collection */
Meteor.publishUnderDifferentName = (
  pubName,
  collection,
  newName,
  selectorFn = () => ({}),
  optionsFn = () => ({}),
  extendFn = fields => fields
) => Meteor.publish(pubName, function({ selector, limit, sort } = {}) {
  check(arguments, Object);
  check(selector, Match.OneOf(undefined, Object));
  check(limit, Match.OneOf(undefined, Number));
  check(sort, Match.OneOf(undefined, Object));

  const self = this;
  const userId = this.userId;

  const handle = collection.find(selectorFn(selector, userId), optionsFn(limit, sort, userId)).observeChanges( {
    added: (id, fields) => self.added(newName, id, extendFn(fields)),
    changed: (id, fields) => self.changed(newName, id, fields),
    removed: (id) => self.removed(newName, id),
  });

  self.ready();
  self.onStop(() => handle.stop());
});


/* Products collection related helpers */

this.isShopAdmin = userId => Roles.userIsInRole(userId, ["admin"], ReactionCore.getShopId());
this.isShopOwner = userId => Roles.userIsInRole(userId, ["createProduct"], ReactionCore.getShopId());

this.sortByLatestOrderDate = () => ({ latestOrderDate: 1 });

this.getProductsPubOptions = (limit = 24, sort) => ({
  sort: sort || sortByLatestOrderDate(),
  limit,
});

this.baseProductsSelector = () => ({
  shopId: ReactionCore.getShopId(),
  // Using '$not: {$ne' instead of '$eq'. The issue is solved in Meteor 1.3.3: https://github.com/meteor/meteor/issues/4142
  ancestors: { $exists: true, $not: {$ne: [] } },
})

this.extendProductWithLocation = fields => {
  const { profile } = Meteor.users.findOne(fields.userId) || {};
  const locationExt = profile && profile.latitude && profile.longitude ? {
    location: {
      lat: profile.latitude,
      lng: profile.longitude,
    }
  } : {};

  const address = getUserAddress(fields.userId);
  if (address) locationExt.location = { ...locationExt.location, address };

  return { ...fields, ...locationExt };
}
