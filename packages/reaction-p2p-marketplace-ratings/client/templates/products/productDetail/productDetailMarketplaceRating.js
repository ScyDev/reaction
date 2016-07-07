
Template.productDetailMarketplaceRating.onCreated(
  function() {
    ReactionCore.Subscriptions.Orders = ReactionSubscriptions.subscribe("Orders");

    /*
    Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
      //if ($('.rateit').length === 0) { // make sure its only injected once, not on every rendered event. should be obsolete with onCreated.
        Blaze.renderWithData(Template.productDetailMarketplaceRating, this.data, $(".col-sm-5.pdp-left-column")[0])
        console.log('injected rating field');
      //}
    }, 100);
    */
  }
);

Template.productDetailMarketplaceRating.onRendered(function(){
  //Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
    $('.rateit').rateit({resetable: false});

    //console.log("data: %o",this.data);
    let rateeId = this.data._id;

    // display average rating
    ReactionCore.Subscriptions.Ratings = ReactionSubscriptions.subscribe("Ratings");
    if (ReactionCore.Subscriptions.Ratings.ready()) {
      let ratings = ReactionCore.Collections.Ratings.find({rateeId: rateeId}).fetch();
      //console.log("ratings: %o",ratings);

      let cumulatedRatings = 0;
      for (let i = 0; i < ratings.length; i++) {
        cumulatedRatings += ratings[i].value;
      }
      let averageRating = cumulatedRatings/ratings.length;

      $('.rateit').rateit('value', averageRating);
    }

    // user input
    $('.rateit').bind('rated', function() {
      //console.log('rating: ' + $(this).rateit('value'));

      // check if user bought something from ratee
      let orderExists = ReactionCore.Collections.Orders.findOne({userId: Meteor.userId(), "items.sellerId": rateeId});
      if (orderExists) {
        ReactionCore.Subscriptions.Ratings = ReactionSubscriptions.subscribe("Ratings");
        if (ReactionCore.Subscriptions.Ratings.ready()) {
          let rating = ReactionCore.Collections.Ratings.findOne({raterId: Meteor.userId(), rateeId: rateeId});
          //console.log("rating: %o",rating);

          if (rating == null) {
            ReactionCore.Collections.Ratings.insert(
              {
                raterId: Meteor.userId(),
                rateeId: rateeId,
                value: $(this).rateit('value')
              }
            );
            //console.log('inserted rating');
          }
          else {
            ReactionCore.Collections.Ratings.update(
              {
                _id: rating._id
              },
              {
                $set: {
                  value: $(this).rateit('value')
                }
              }
            );
            //console.log('updated rating');
          }
        }
      }
      else {
        console.log("Rating denied. You didn't buy anything from this seller.");
      }
    });

  //}, 100);
});
