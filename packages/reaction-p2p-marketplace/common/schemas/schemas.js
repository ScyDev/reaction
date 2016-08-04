ReactionCore.Schemas.p2pMarketplaceConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    "settings.public": {
      type: Object,
    },
    "settings.public.maxUploadSize": {
      type: Number,
      label: "Maximum allowed image size (bytes)",
    },
    "settings.public.imageAutoOrient": {
      type: Boolean,
      label: "Automatically orient uploaded images",
    },
  }
]);
