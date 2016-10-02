Package.describe({
  name: 'scydev:reaction-p2p-marketplace',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Some basic shop extensions.',
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
  api.use("email");
  api.use("session");
  api.use("jquery");
  api.use("tracker");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("spacebars");
  api.use("check");
  api.use("reactive-var");

  api.use("utilities:spin");
  api.use("aldeed:template-extension");

  api.use('ecmascript');
  api.use('templating');
  api.use("less");
  api.use("reactioncommerce:core");
  api.use("reactioncommerce:reaction-product-variant");
  api.use("reactioncommerce:reaction-layout");

  api.addFiles("client/collections/index.js", ["client"]);
  api.addFiles("client/helpers/filters.js", ["client"]);
  api.addFiles("client/helpers/globals.js", ["client"]);
  api.addFiles("client/helpers/i18n.js", ["client"]);
  api.addFiles("client/helpers/products.js", ["client"]);
  api.addFiles("client/helpers/tags.js", ["client"]);
  api.addFiles('client/helpers/validation.js', 'client');

  // api.use("scydev:reaction-p2p-marketplace-sell-date");
  // api.use("scydev:reaction-search");
  api.use("scydev:reaction-email-templates-custom");
  api.imply("scydev:reaction-email-templates-custom");

  /* Should be before those files, which use events/helpers overrides */
  api.addFiles("client/helpers/utilities/index.js", ["client"]);
  api.addAssets("private/data/shop.json", "server");
  api.addFiles("server/init.js", "server");

  // i18n translations
  /* Due to Meteor builder bug (deduplication?!) private assets with the same CRC (regardless the filename) as ones in other packages are skipped from bundling */
  api.addFiles("server/i18n.js", "server");
  api.addAssets("private/i18n/ar.json", "server");
  api.addAssets("private/i18n/bg.json", "server");
  api.addAssets("private/i18n/cn.json", "server");
  api.addAssets("private/i18n/cs.json", "server");
  api.addAssets("private/i18n/de.json", "server");
  api.addAssets("private/i18n/en.json", "server");
  api.addAssets("private/i18n/el.json", "server");
  api.addAssets("private/i18n/es.json", "server");
  api.addAssets("private/i18n/fr.json", "server");
  api.addAssets("private/i18n/he.json", "server");
  api.addAssets("private/i18n/hr.json", "server");
  api.addAssets("private/i18n/hu.json", "server");
  api.addAssets("private/i18n/it.json", "server");
  api.addAssets("private/i18n/my.json", "server");
  api.addAssets("private/i18n/nl.json", "server");
  api.addAssets("private/i18n/pl.json", "server");
  api.addAssets("private/i18n/pt.json", "server");
  api.addAssets("private/i18n/ru.json", "server");
  api.addAssets("private/i18n/sl.json", "server");
  api.addAssets("private/i18n/sv.json", "server");
  api.addAssets("private/i18n/tr.json", "server");
  api.addAssets("private/i18n/vi.json", "server");
  api.addAssets("private/i18n/nb.json", "server");

  api.addFiles('common/collections/collections.js');
  api.addFiles("common/collections/collectionFS.js");
  api.addFiles('common/schemas/accounts.js');
  api.addFiles('common/schemas/cart.js');
  api.addFiles('common/schemas/orders.js');
  api.addFiles('common/schemas/products.js');
  api.addFiles("common/schemas/schemas.js");

  api.addFiles('reaction-p2p-marketplace.js');

  api.addFiles("server/register.js", ["server"]);
  api.addFiles("server/security.js", ["server"]);

  api.addFiles("server/methods/utilities/index.js", "server");
  api.addFiles("server/methods/accounts.js", "server");
  api.addFiles("server/methods/cart.js", ["server"]);
  api.addFiles("server/methods/checkout.js", ["server"]);
  api.addFiles("server/methods/inventory.js", ["server"]);
  api.addFiles("server/methods/orders.js", ["server"]);
  api.addFiles('server/methods/products.js', 'server');

  api.addFiles('server/publications/orders.js', 'server');
  api.addFiles('server/publications/productsForOrdersHistory.js', 'server');
  api.addFiles("server/publications/pub-utils.js", ["server"]);
  api.addFiles("server/publications/publicProducts.js", ["server"]);
  api.addFiles("server/publications/sellerProducts.js", ["server"]);

  api.addFiles("client/templates/style.less", ["client"]);

  api.addFiles('client/templates/addressBook/addressBook.html', 'client');
  api.addFiles('client/templates/addressBook/addressBook.js', 'client');

  api.addFiles("client/templates/cart/checkout/header/header.html", ["client"]);
  api.addFiles("client/templates/cart/checkout/header/header.js", ["client"]);

  api.addFiles("client/templates/dropdown/dropdown.html", ["client"]);
  api.addFiles("client/templates/dropdown/dropdown.js", ["client"]);
  api.addFiles("client/templates/dropdown/dropdown.less", ["client"]);

  api.addFiles("client/templates/cart/checkout/completed/completed.html", "client");
  api.addFiles("client/templates/cart/checkout/completed/completed.js", "client");
  api.addFiles("client/templates/cart/checkout/checkout.html", "client");
  api.addFiles("client/templates/cart/checkout/checkout.js", "client");

  api.addFiles("client/templates/dashboard/dashboard.js", "client");
  api.addFiles("client/templates/dashboard/orders/orders.html", "client");
  api.addFiles("client/templates/dashboard/orders/orders.js", "client");

  api.addFiles('client/templates/dashboard/orders/details/detail.html', 'client');
  api.addFiles('client/templates/dashboard/orders/details/detail.js', 'client');

  api.addFiles("client/templates/dashboard/orders/list/items/items.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/items/items.js", "client");
  api.addFiles("client/templates/dashboard/orders/list/itemSeller/itemSeller.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/itemSeller/itemSeller.js", "client");
  api.addFiles("client/templates/dashboard/orders/list/ordersList.html", "client");
  api.addFiles("client/templates/dashboard/orders/list/ordersList.js", "client");

  api.addFiles('client/templates/dashboard/orders/sellerOrders.html', 'client');
  api.addFiles('client/templates/dashboard/orders/sellerOrders.js', 'client');
  api.addFiles('client/templates/dashboard/orders/sellerOrders.less', 'client');

  api.addFiles('client/templates/dashboard/products/list/productsList.html', 'client');
  api.addFiles('client/templates/dashboard/products/list/productsList.js', 'client');
  api.addFiles('client/templates/dashboard/products/list/productsList.less', 'client');

  api.addFiles("client/templates/dashboard/settings/settings.html", "client");
  api.addFiles("client/templates/dashboard/settings/settings.js", "client");

  api.addFiles("client/templates/members/member.html", "client");
  api.addFiles("client/templates/members/member.js", "client");

  api.addFiles("client/templates/products/productsViewSwitcher.html", ["client"]);
  api.addFiles("client/templates/products/productsMarketplace.html", ["client"]);
  api.addFiles("client/templates/products/productsMarketplace.js", ["client"]);
  api.addFiles("client/templates/products/products.less", ["client"]);

  api.addFiles("client/templates/products/productDetail/edit/edit.html", ["client"]);
  api.addFiles("client/templates/products/productDetail/edit/edit.js", ["client"]);
  api.addFiles("client/templates/products/productDetail/images/productImageGallery.html", ["client"]);
  api.addFiles("client/templates/products/productDetail/images/productImageGallery.js", ["client"]);
  api.addFiles('client/templates/products/productDetail/variants/variantForm/variantForm.html', 'client');
  api.addFiles('client/templates/products/productDetail/variants/variantForm/variantForm.js', 'client');
  api.addFiles('client/templates/products/productDetail/productDetail.html', 'client');
  api.addFiles("client/templates/products/productDetail/productDetail.js", ["client"]);
  api.addFiles('client/templates/products/productDetail/productDetail.less', 'client');

  api.addFiles("client/templates/products/productGrid/content/content.html", ["client"]);
  api.addFiles("client/templates/products/productGrid/content/content.js", ["client"]);
  api.addFiles("client/templates/products/productGrid/controls/controls.html", ["client"]);
  api.addFiles("client/templates/products/productGrid/controls/controls.js", ["client"]);
  api.addFiles("client/templates/products/productGrid/productGrid.html", ["client"]);
  api.addFiles("client/templates/products/productGrid/productGrid.js", ["client"]);

  api.addFiles("client/templates/products/productList/productList.html", ["client"]);
  api.addFiles("client/templates/products/productList/productList.js", ["client"]);
  api.addFiles("client/templates/products/productList/productList.less", ["client"]);

  api.addFiles('client/templates/signIn/signIn.html', 'client');
  api.addFiles('client/templates/signIn/signIn.js', 'client');

  api.addFiles('client/templates/signUp/sellerFlag.html', 'client');
  api.addFiles('client/templates/signUp/signUp.html', 'client');
  api.addFiles('client/templates/signUp/signUp.js', 'client');

  api.addFiles('client/templates/userDecision/userDecision.html', 'client');
  api.addFiles('client/templates/userDecision/userDecision.js', 'client');
  api.addFiles('client/templates/userDecision/userDecision.less', 'client');

  api.addFiles("client/templates/search/searchBox.html", "client");

  api.addFiles("client/theme/dashboard/orders/index.css", "client");

  api.addFiles("public/images/decision_deco.jpg", ["client"], {isAsset: true});

});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('scydev:reaction-p2p-marketplace');
  api.addFiles('reaction-p2p-marketplace-tests.js');
});
