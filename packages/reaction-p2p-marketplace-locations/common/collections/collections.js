/**
* ReactionCore Collections MapMarkers
*/
ReactionCore.Collections.MapMarkers = new Mongo.Collection("MapMarkers");

ReactionCore.Collections.MapMarkers.attachSchema(ReactionCore.Schemas.MapMarker);

ReactionCore.Collections.MapMarkers.allow({
  insert: function(userId, doc) {
    // only allow posting if you are logged in
    return !! userId;
  }
});


this.getGoogleMapsApiKey = () =>
  ReactionCore.Collections.Packages.findOne(
    {name: "reaction-p2p-marketplace-locations"},
    {fields: {"settings.public.googleMapsApiKey": 1}}
    ).settings.public.googleMapsApiKey
