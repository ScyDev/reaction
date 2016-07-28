Package.describe({
  name: "scydev:reaction-p2p-marketplace-locations",
  version: "0.0.1",
  // Brief, one-line summary of the package.
  summary: "Shows products on Google Maps",
  // URL to the Git repository containing the source code for this package.
  git: "",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");
  // api.versionsFrom("1.2.1");

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

  api.use("ecmascript");
  api.use("templating");
  api.use("less");
  api.use("reactioncommerce:core@0.10.0");
  api.use("reactive-var");

  api.use("scydev:reaction-p2p-marketplace");
  api.use("reactioncommerce:reaction-product-variant");

  api.use("dburles:google-maps");

  // common files
  api.addFiles([
    "common/schemas/schemas.js",
    "common/schemas/mapmarkers.js",
    "common/collections/collections.js"
  ]);

  // client files
  api.addFiles([
    "client/templates/products/productMap/productMap.html",
    "client/templates/products/productMap/productMap.less",
    "client/templates/products/productMap/productMap.js",
    "client/templates/products/productMap/productMapSingle.html",
    "client/templates/products/productMap/productMapSingle.js",
    "client/templates/products/locationField/locationField.html",
    "client/templates/products/locationField/locationField.js",
    "client/templates/products/locationFieldDisplay/locationFieldDisplay.html",
    "client/templates/products/locationFieldDisplay/locationFieldDisplay.js",
  ],
  "client");

  api.addFiles("client/templates/products/productMapDetails/productMapDetails.html", "client");
  api.addFiles("client/templates/products/productMapDetails/productMapDetails.js", "client");
  api.addFiles("client/templates/products/productMapDetails/productMapDetails.less", "client");

  api.addFiles("client/templates/dashboard/locations.html", ["client"]);
  api.addFiles("client/templates/dashboard/locations.js", ["client"]);

  api.addFiles("client/templates/products/products.js", ["client"]);

  api.addFiles("public/images/icon.png", ["client"], {isAsset: true});

  // server files
  api.addFiles("server/register.js", ["server"]);
  api.addFiles([
    "server/methods/accounts.js",
    "server/security/browserPolicy.js",
    "server/security/security.js"
  ],
  ["server"]);

  api.addFiles("reaction-p2p-marketplace-locations.js");
});

Package.onTest(function (api) {
  api.use("ecmascript");
  api.use("tinytest");
  api.use("scydev:reaction-p2p-marketplace-locations");
  api.addFiles("reaction-p2p-marketplace-locations-tests.js");
});
