
/* Replace method preserving the hooks */
this.replaceMethod = (methodName, f) => {
  // Meteor.isClient ? Meteor.connection._methodHandlers : Meteor.server.method_handlers;
  const hooks = ReactionCore.MethodHooks;
  const methodHandlers = hooks._originalMethodHandlers[methodName] ? hooks._originalMethodHandlers : hooks._handlers;
  methodHandlers[methodName] = f;
}
