Package.describe({
  name: 'scydev:reaction-p2p-marketplace-seller',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Allow users to be sellers.',
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

  api.use("reactioncommerce:reaction-product-variant");

  api.use("aldeed:template-extension");

  //api.use("gwendall:autoform-i18n");
  //api.use("gwendall:simple-schema-i18n");

  api.addFiles('reaction-p2p-marketplace-seller.js');

  api.addFiles('client/templates/dashboard/products/list/productsList.html', 'client');
  api.addFiles('client/templates/dashboard/products/list/productsList.js', 'client');
  api.addFiles('client/templates/dashboard/products/list/productsList.less', 'client');
  api.addFiles('client/templates/dashboard/orders/sellerOrders.html', 'client');
  api.addFiles('client/templates/dashboard/orders/sellerOrders.js', 'client');
  api.addFiles('client/templates/dashboard/orders/sellerOrders.less', 'client');
  api.addFiles('client/templates/dashboard/orders/details/detail.html', 'client');
  api.addFiles('client/templates/dashboard/orders/details/detail.js', 'client');
  api.addFiles('client/templates/signUp/sellerFlag.html', 'client');
  api.addFiles('client/templates/signUp/signUp.html', 'client');
  api.addFiles('client/templates/signUp/signUp.js', 'client');
  api.addFiles('client/templates/signIn/signIn.html', 'client');
  api.addFiles('client/templates/signIn/signIn.js', 'client');
  api.addFiles('client/templates/userDecision/userDecision.html', 'client');
  api.addFiles('client/templates/userDecision/userDecision.js', 'client');
  api.addFiles('client/templates/userDecision/userDecision.less', 'client');
  api.addFiles('client/helpers/validation.js', 'client');
  api.addFiles('client/templates/products/productDetail/productDetail.html', 'client');
  api.addFiles('client/templates/products/productDetail/productDetail.js', 'client');
  api.addFiles('client/templates/products/productDetail/productDetail.less', 'client');
  api.addFiles('client/templates/products/productDetail/variants/variantForm/variantForm.html', 'client');
  api.addFiles('client/templates/products/productDetail/variants/variantForm/variantForm.js', 'client');
  api.addFiles('client/templates/addressBook/addressBook.html', 'client');
  api.addFiles('client/templates/addressBook/addressBook.js', 'client');
  api.addFiles('client/helpers/globals.js', 'client');

  api.addFiles("public/images/decision_deco.jpg", ["client"], {isAsset: true});

  api.addFiles('common/schemas/accounts.js');
  api.addFiles('common/schemas/products.js');
  api.addFiles('common/schemas/cart.js');
  api.addFiles('common/schemas/orders.js');
  api.addFiles('common/collections/collections.js');

  api.addFiles('server/publications/orders.js', 'server');
  api.addFiles('server/publications/products.js', 'server');
  api.addFiles('server/publications/productsForOrdersHistory.js', 'server');
  api.addFiles('server/publications/product.js', 'server');
  api.addFiles('server/methods/accounts.js', 'server');
  api.addFiles('server/methods/products.js', 'server');
  api.addFiles('server/methods/cart.js', 'server');
  api.addFiles('server/register.js', 'server');

});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-p2p-marketplace-seller');
  api.addFiles('reaction-p2p-marketplace-seller-tests.js');
});
