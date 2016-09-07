Template.wrapGlobalHelper = (helperName, wrapper) => {
  const originalHelper = Blaze._globalHelpers[helperName];
  if(!originalHelper) return
  Template.registerHelper(helperName, (...options) => wrapper(originalHelper(...options)));
}


/*
 Wraps the ALL existing handlers with the one new
  Wrapper functions accepts (event, handlers) parameters
*/
Template.wrapEventHandlers = (template, event, wrapper) => {
  let originalHandlers = [];
  Template[template].__eventMaps.forEach((map, i) => {
    if (map[event]) originalHandlers.push(map[event]);
    delete map[event];
    if(!Object.keys(map).length) Template[template].__eventMaps.splice(i, 1);
  });
  const injector = function(event) {
    let result
    wrapper(event, event => originalHandlers.forEach(handler => {
      result = handler(event) || result;
    }));
    return result;
  }
  Template[template].events({ [event]: injector });
}

/*
 Alias for Template.wrapEventHandlers()
 */
Template.overrideEventHandlers = Template.wrapEventHandlers;
// Template.overrideEventHandler = (template, event, newHandler) => {
//   Template[template].__eventMaps.forEach((map, i) => {
//     delete map[event];
//     if(!Object.keys(map).length) Template[template].__eventMaps.splice(i, 1);
//   });
//   Template[template].events({ [event]: newHandler });
// }


Template.clone = (source, dest) => {
  Template.__checkName(dest); // Will throw exception if 'dest' template already exists
  Template[dest] = new Template(dest, Template[source].renderFunction);
}
