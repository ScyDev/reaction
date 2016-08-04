
/*
ReactionCore.Schemas.Accounts = new SimpleSchema([
  ReactionCore.Schemas.Accounts, {
    / * wait a moment! user already has adresses! use those!
    "address": {
      type: String,
      //defaultValue: true,
      optional: false
    },
    * /
    "lat": {
      type: String,
      //defaultValue: true,
      optional: true
    },
    "long": {
      type: String,
      //defaultValue: true,
      optional: true
    },
  }
]);*/

ReactionCore.Schemas.LocationsPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    "settings.public": {
      type: Object,
      optional: true
    },
    "settings.public.googleMapsApiKey": {
      type: String,
      label: "Google Maps API key",
      optional: true
    },
    "settings.public.apps": {
      type: Object,
      label: "Locations Settings",
      optional: true
    },
    "settings.public.apps.locations.sellers": {
      type: Boolean,
      defaultValue: true,
      optional: true
    },
    "settings.public.apps.locations.products": {
      type: Boolean,
      defaultValue: true,
      optional: true
    },
    /*
    "settings.public.apps.twitter": {
      type: ReactionCore.Schemas.SocialProvider,
      optional: true
    },*/
    "settings.public.apps.locations.test": {
      type: String,
      optional: true
    },

  }
]);
