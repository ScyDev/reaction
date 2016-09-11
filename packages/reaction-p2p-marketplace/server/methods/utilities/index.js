
/* Replace method preserving the hooks */
this.replaceMethod = (methodName, f) => {
  // Meteor.isClient ? Meteor.connection._methodHandlers : Meteor.server.method_handlers;
  const hooks = ReactionCore.MethodHooks;
  const methodHandlers = hooks._originalMethodHandlers[methodName] ? hooks._originalMethodHandlers : hooks._handlers;
  methodHandlers[methodName] = f;
}

//
// ReactionCore.MethodHooks.wrapAfter = (helperName, wrapper) => {
//   const originalHelper = Blaze._globalHelpers[helperName];
//   if(!originalHelper) return
//   Template.registerHelper(helperName, (...options) => wrapper(originalHelper(...options)));
// }


/* Add new hook at the beginning of the list */
ReactionCore.MethodHooks.firstAfter = function (methodName, afterFunction) {
  ReactionCore.MethodHooks._initializeFirstHook(ReactionCore.MethodHooks._afterHooks,
    methodName, afterFunction);
};


ReactionCore.MethodHooks._initializeFirstHook = function (mapping, methodName, hookFunction) {
  /* Add noop hook first to be sure the hooks wrapper is initialized */
  const noop = () => {}
  ReactionCore.MethodHooks._initializeHook(mapping, methodName, noop);
  mapping[methodName].unshift(hookFunction);
};
