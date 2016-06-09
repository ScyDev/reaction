
Meteor.publish("Ratings", function () {
  return ReactionCore.Collections.Ratings.find(
    /*
    {
      raterId: Meteor.userId()
    }*/
  );

});
