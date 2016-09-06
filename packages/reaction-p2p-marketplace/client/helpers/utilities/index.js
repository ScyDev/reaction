Template.wrapGlobalHelper = (helperName, wrapper) => {
  const originalHelper = Blaze._globalHelpers[helperName];
  if(!originalHelper) return
  Template.registerHelper(helperName, (...options) => wrapper(originalHelper(...options)));
}

Template.overrideEventHandler = (template, event, newHandler) => {
  Template[template].__eventMaps.forEach((map, i) => {
    delete map[event];
    if(!Object.keys(map).length) Template[template].__eventMaps.splice(i, 1);
  });
  Template[template].events({ [event]: newHandler });
}


Template.clone = (source, dest) => {
  Template.__checkName(name);
  Template[dest] = new Template(dest, Template[source].renderFunction);
}
