
ReactionCore.Schemas.Ratings = new SimpleSchema(
  {
    "raterId": {
      type: String,
      optional: false
    },
    "rateeId": {
      type: String,
      optional: false
    },
    "value": {
      type: Number,
      decimal: true,
      optional: false
    },
  }
);
