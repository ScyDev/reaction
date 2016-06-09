// Write your package code here!

ReactionCore.i18nextInitForServer = function(i18next) {

              let packageNamespaces = [];

              // every package gets a namespace, fetch them
              // const packageNamespaces = [];
              let packages = ReactionCore.Collections.Packages.find({}, {
                fields: {
                  name: 1
                }
              }).fetch();
              for (const pkg of packages) {
                packageNamespaces.push(pkg.name);
              }


              let translations = ReactionCore.Collections.Translations
                .find({}, {
                  fields: {
                    _id: 0
                  }
                }).fetch();
              // map reduce translations into i18next formatting
              const resources = translations.reduce(function (x, y) {
                x[y.i18n] = y.translation;
                return x;
              }, {});

              //
              // initialize i18next
              //
              i18next
                .use(i18nextBrowserLanguageDetector)
                .use(i18nextLocalStorageCache)
                .use(i18nextSprintfPostProcessor)
                .use(i18nextJquery)
                .init({
                  debug: false,
                  ns: packageNamespaces, // translation namespace for every package
                  defaultNS: "core", // reaction "core" is the default namespace
                  lng: "de", // user session language
                  fallbackLng: "de", // Shop language
                  resources: resources
                    // saveMissing: true,
                    // missingKeyHandler: function (lng, ns, key, fallbackValue) {
                    //   Meteor.call("i18n/addTranslation", lng, ns, key, fallbackValue);
                    // }
                }, (err, t) => {

                });


                return i18next;

}
