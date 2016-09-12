const omit = (o, ...props) => props.reduce((r, p) => p in o ? r : {...r, [p]: o[p]}, {})


Template.wrapGlobalHelper = (helperName, wrapper) => {
  const originalHelper = Blaze._globalHelpers[helperName];
  if(!originalHelper) return
  Template.registerHelper(helperName, (...options) => wrapper(originalHelper(...options)));
}


/*
  Wraps the ALL existing handlers with the one new
  Wrapper functions accepts (event, instance, handlers) parameters
*/
Template.wrapEventHandlers = (template, eventName, wrapper, keepOriginal = true) => {
  if (!template || !eventName || typeof wrapper !== 'function') return;
  let originalHandlers = [];
  Template[template].__eventMaps.forEach((map, i) => {
    if (!map[eventName]) return;
    if (keepOriginal) originalHandlers.push(map[eventName]);
    delete map[eventName];
    if(!Object.keys(map).length) Template[template].__eventMaps.splice(i, 1);
  });
  const injector = function(event, instance) {
    return wrapper.call(this, event, instance, () => {
      let result;
      originalHandlers.forEach((handler, i) => result = handler.call(instance.view, event) || result)
      return result;
    });
  }
  Template[template].events({ [eventName]: injector });
}


/*
  Overrides the ALL existing handlers with the one new
  Wrapper functions accepts (event, instance) parameters
 */
Template.overrideEventHandlers = (template, event, newHandler) =>
  Template.wrapEventHandlers(template, event, newHandler, false)


Template.clone = (source, dest) => {
  Template.__checkName(dest); // Will throw exception if 'dest' template already exists
  Template[dest] = new Template(dest, Template[source].renderFunction);
}
