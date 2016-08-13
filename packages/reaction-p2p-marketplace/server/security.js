/*
 * Assign to some local short names to keep code short and sweet
 */
const {
  Accounts,
  Media,
} = ReactionCore.Collections;

/*
 * Allow image upload by buyer (non-admin)
 */
Security.permit(["insert", "remove"]).collections([Media]).ifHasRole({
  role: ["guest"],
  group: ReactionCore.getShopId()
}).ifFileBelongsToShop().apply();

/*
 * Users may update their own account, but the protected fields.
 * Store isSeller, isDecided, acceptedTerms flags on Account, not user.profile, because:
 *  - after login, user was loaded but isDecided flag not available.
 *  - Meteor doc recommends not to use profile.
 */
Security.defineMethod("ifNotProtecedFields", {
  fetch: ["isDecided", "isSeller", "acceptedTerms"],
  deny: function(type, arg, userId, doc, fields, modifier) {
    if (_.intersection(fields, ["isDecided", "isSeller", "acceptedTerms"]).length > 0) {
      return true;
    }
  }
});
/* Clean up original 'insert' and 'update' rules */
Accounts._validators.insert = { allow: [], deny: [] }
Accounts._validators.update = { allow: [], deny: [] }
/* Define new rule */
Accounts.permit(["insert", "update"]).ifHasRole({
  role: ["anonymous", "guest"],
  group: ReactionCore.getShopId()
}).ifUserIdMatches().ifNotProtecedFields().apply();
