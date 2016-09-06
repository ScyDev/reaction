Blaze._globalHelpers

Blaze._getTemplateHelper


Template.wrapGlobalHelper = (helperName, wrapper) => {
  const originalHelper = Blaze._globalHelpers[helperName];
  if(!originalHelper) return
  Template.registerHelper(helperName, (...options) => wrapper(originalHelper(...options)));
}
