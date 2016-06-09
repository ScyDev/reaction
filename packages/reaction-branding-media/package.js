Package.describe({
  name: 'scydev:reaction-branding-media',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
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
  
  // First initialize html file! otherwise there will be an error 'undefined'
  api.addFiles(['newLayoutHeader.html',
                'newLayoutHeader.js',
                'reaction-branding-media.js'
                ],
                'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-branding-media');
  api.addFiles('reaction-branding-media-tests.js');
});
