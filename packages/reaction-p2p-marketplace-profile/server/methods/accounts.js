
ReactionCore.Hooks.Events.add(
  "onCreateUser",
  function(user, options) {
    ReactionCore.Log.info("ReactionCore.Hooks.Events -> onCreateUser options: "+options);
    const shop = ReactionCore.getCurrentShop();
    const shopId = shop._id;

    ReactionCore.Log.info("Adding profile permissions.");

    user.roles[shopId].push("/profile/:userId");
    user.roles[shopId].push("marketplaceProfile"); // this seems to work while the above does not if main path (shop name) is something different than /reaction ?

    return user;
  }
);
