/* Pass the name of the package to the function. Translation files should be under /private/i18n directory. */
this.loadTranslationsFromModule = packageName => {
  const fs = Npm.require("fs");
  const readFolder = Meteor.wrapAsync(fs.readdir, fs);

  const assetsPath = `${process.cwd()}/assets/packages/${packageName.replace(":", "_")}`;
  const i18nDir = `${assetsPath}/private/i18n/`;
  readFolder(i18nDir, (err, files) => {
    if (err) return;
    files.filter(f => f.indexOf('json')).forEach(f => {
      ReactionCore.Log.info(`Importing translations from '${packageName}/${f}'`);
      const json = Assets.getText(`private/i18n/${f}`);
      ReactionImport.process(json, ["i18n"], ReactionImport.translation);
    });
    ReactionImport.flush();
  });
};

/**
 * Hook to setup core i18n imports during ReactionCore init
 */
if (ReactionCore && ReactionCore.Hooks) {
    ReactionCore.Hooks.Events.add("onCoreInit", (result, constant) => {
      /* Delay start to be sure, the original import is already completed */
      Meteor.setTimeout(() => loadTranslationsFromModule('scydev:reaction-p2p-marketplace'), 4000)
    });
}
