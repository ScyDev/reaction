
ReactionCore.Schemas.Accounts = new SimpleSchema([
  ReactionCore.Schemas.Accounts, {
    isSeller: {
      type: Boolean,
      defaultValue: false,
      optional: true
    },
    acceptedTerms: {
      type: Boolean,
      defaultValue: false,
      optional: true
    },
    isDecided: {
      type: Boolean,
      defaultValue: false,
      optional: true
    },
  }
]);
