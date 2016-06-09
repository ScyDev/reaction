
ReactionCore.Collections.Ratings.allow({
  insert: function(userId, rating) {
    if (Match.test(rating, ReactionCore.Schemas.Ratings)) {
      return true
    }
    return false
  },
  update: function(userId, rating, fields, modifier) {
    ReactionCore.Log.info("ReactionCore.Collections.Ratings.allow.update() ",rating);
    if (userId != rating.raterId) {
      return false;
    }
    return true;
  },
  remove: function(userId, rating) {
    if (rating.shopId !== ReactionCore.getShopId()) {
      return false;
    }
    return true;
  }
});
