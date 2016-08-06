
// overriding product schema with extended version
ReactionCore.Schemas.Product = new SimpleSchema([
  ReactionCore.Schemas.Product, {
    "forSaleOnDate": {
      type: Date,
      /*
      autoValue: function() { // too bad, autoValue can not be overwritten with input value
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      },*/
      defaultValue: new Date(new Date().getTime() + 1000*60*60*24*2),
      optional: false
    },
    "pickupTimeFrom": {
      type: String,
      defaultValue: "12:00",
      optional: false
    },
    "pickupTimeTo": {
      type: String,
      defaultValue: "12:30",
      optional: false
    },
    "latestOrderDate": {
      type: Date,
      /*
      autoValue: function() { // too bad, autoValue can not be overwritten with input value
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      },*/
      defaultValue: new Date(new Date(new Date().toDateString()+" 09:30:00").getTime() + 1000*60*60*24*2),
      optional: false
    },
  }
]);
