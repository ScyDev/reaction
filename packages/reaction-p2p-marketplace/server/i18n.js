/* Pass the name of the package to the function. Translation files should be under /private/i18n directory. */
this.loadTranslationsFromModule = packageName => {
  const fs = Npm.require("fs");
  const readFolder = Meteor.wrapAsync(fs.readdir, fs);

  const assetsPath = `${process.cwd()}/assets/packages/${packageName.replace(":", "_")}`;
  const i18nDir = `${assetsPath}/private/i18n/`;
  console.log(assetsPath)
  readFolder(i18nDir, function (err, files) {
    if (err) throw new Meteor.Error("No translations found for import.", err);
    for (const file of files) {
      if (file.indexOf("json")) {
        ReactionCore.Log.debug(`Importing translations from '${packageName}/${file}'`);
        const json = Assets.getText("private/i18n/" + file);
        ReactionImport.process(json, ["i18n"], ReactionImport.translation);
      }
    }
  });
};

/**
 * Hook to setup core i18n imports during ReactionCore init
 */
if (ReactionCore && ReactionCore.Hooks) {
  ReactionCore.Hooks.Events.add("onCoreInit", () => {
    loadTranslationsFromModule('scydev:reaction-p2p-marketplace');
  });
}
