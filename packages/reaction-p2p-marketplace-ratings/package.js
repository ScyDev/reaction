Package.describe({
  name: 'scydev:reaction-p2p-marketplace-ratings',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Ratings for sellers and buyers',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');

  // meteor base packages
  api.use("standard-minifiers");
  api.use("mobile-experience");
  api.use("meteor-base");
  api.use("mongo");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("spacebars");
  api.use("check");

  api.use('ecmascript');
  api.use('templating');
  api.use("less");
  api.use("reactioncommerce:core@0.10.0");

  api.use("dandv:jquery-rateit");

  api.addFiles('reaction-p2p-marketplace-ratings.js');

  api.addFiles('client/templates/products/productDetail/productDetailMarketplaceRating.html', 'client');
  api.addFiles('client/templates/products/productDetail/productDetailMarketplaceRating.js', 'client');

  api.addFiles('common/schemas/ratings.js');
  api.addFiles('common/collections/collections.js');

  api.addFiles('server/security/ratings.js', 'server');
  api.addFiles('server/publications/ratings.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-p2p-marketplace-ratings');
  api.addFiles('reaction-p2p-marketplace-ratings-tests.js');
});
