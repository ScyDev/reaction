Package.describe({
  name: 'scydev:reaction-p2p-marketplace-sell-date',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Adds a for sale date on products.',
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

  api.use("aldeed:template-extension");
  api.use("tsega:bootstrap3-datetimepicker");
  // moment-package for translated and formatted date
  api.use('rzymek:moment');
  api.use('rzymek:moment-locale-de');

  api.use("reactioncommerce:core");
  api.use("scydev:reaction-p2p-marketplace");

  api.addFiles([
                'reaction-p2p-marketplace-sell-date.js',
                'client/templates/products/dateField/dateField.html',
                'client/templates/products/dateField/dateField.js',
                'client/templates/products/dateField/dateField.less',
                'client/templates/products/productDetail/productDetailWithDate.js',
              ],
              'client'
              );

  // common files
  api.addFiles([
                'common/schemas/products.js',
                'common/collections/collections.js',
              ]);

});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-p2p-marketplace-sell-date');
  api.addFiles('reaction-p2p-marketplace-sell-date-tests.js');
});
