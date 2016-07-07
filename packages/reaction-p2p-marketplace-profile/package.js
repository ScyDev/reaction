Package.describe({
  name: 'scydev:reaction-p2p-marketplace-profile',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Public profile for sellers and buyers.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

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

  api.use("reactive-var");
  api.use("reactive-dict");

  api.use("reactioncommerce:reaction-router");
  api.use("kadira:blaze-layout@2.3.0");

  api.addFiles('client/helpers/validation.js', 'client');
  api.addFiles('client/templates/accountProfile/marketplaceAccountProfile.html', 'client');
  api.addFiles('client/templates/accountProfile/marketplaceAccountProfile.js', 'client');
  api.addFiles('client/templates/accountProfile/marketplaceAccountProfile.less', 'client');
  api.addFiles('client/templates/accountProfile/images/profileImageGallery.html', 'client');
  api.addFiles('client/templates/accountProfile/images/profileImageGallery.js', 'client');

  api.addFiles('client/templates/publicProfile/marketplaceProfile.html', 'client');
  api.addFiles('client/templates/publicProfile/marketplaceProfile.js', 'client');
  api.addFiles('client/templates/publicProfile/marketplaceProfileWidget.html', 'client');
  api.addFiles('client/templates/publicProfile/marketplaceProfileWidget.js', 'client');
  api.addFiles('client/templates/publicProfile/marketplaceProfileWidget.less', 'client');

  api.addFiles('server/publications/account.js', 'server');
  api.addFiles('server/methods/accounts.js', 'server');
  api.addFiles('server/register.js', 'server');

  api.addFiles('reaction-p2p-marketplace-profile.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-p2p-marketplace-profile');
  api.addFiles('reaction-p2p-marketplace-profile-tests.js');
});
