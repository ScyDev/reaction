Package.describe({
  name: 'scydev:reaction-p2p-marketplace-finance',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Manage finances and cash out to sellers.',
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
  api.use("email");
  api.use("reactioncommerce:core@0.10.0");

  api.use("aldeed:template-extension");

  api.addFiles('reaction-p2p-marketplace-finance.js');

  api.addFiles('client/templates/dashboard/settlements/list/settlementsList.html', 'client');
  api.addFiles('client/templates/dashboard/settlements/list/settlementsList.js', 'client');
  api.addFiles('client/templates/dashboard/settlements/list/settlementsList.less', 'client');

  api.addFiles('common/schemas/settlements.js');
  api.addFiles('common/schemas/orders.js');
  api.addFiles('common/collections/collections.js');

  api.addFiles('server/publications/settlements.js', 'server');
  api.addFiles('server/methods/settlements.js', 'server');
  api.addFiles('server/register.js', 'server');

});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-p2p-marketplace-finance');
  api.addFiles('reaction-p2p-marketplace-finance-tests.js');
});
