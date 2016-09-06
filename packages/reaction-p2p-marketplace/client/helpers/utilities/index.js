Blaze._globalHelpers

Blaze._getTemplateHelper


Template.wrapGlobalHelper = (helperName, wrapper) => {
  const originalHelper = Blaze._globalHelpers[helperName];
  if(!originalHelper) return
  Template.registerHelper(helperName, (...options) => wrapper(originalHelper(...options)));
}

Template.overrideEventHandler = (template, event, newHandler) => {
  Template[template].__eventMaps.map( map => delete map[event] );
  Template[template].events({ [event]: newHandler });
}

