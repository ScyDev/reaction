

ReactionCore.MethodHooks.before('genericSubmit', function(options) {
    //"genericSubmit": function (transactionType, cardData, paymentData) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('genericSubmit') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
});
