
ReactionCore.Schemas.MarketplacePackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig,
  {
    "settings.public.autoselect_country": {
      type: Boolean,
      defaultValue: true
    },
  }
]);
