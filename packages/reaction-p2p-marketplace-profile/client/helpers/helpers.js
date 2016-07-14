
Template.registerHelper("hasProfileImage", function (currentUser, size) {
  const user = currentUser;
  console.log( "hasProfileImage | user", user )
  if (!user) return false;

  const profileImage = ReactionCore.Collections.Media.findOne({"metadata.userId": user._id}, {sort: {"metadata.priority": 1}});
  if (profileImage) {
    console.log( "hasProfileImage | profile image:", profileImage.url({ store: "thumbnail" }) )
    return profileImage.url({ store: "thumbnail" })
  }
  else {
    return null; //Blaze._globalHelpers.getGravatar(currentUser, size);
  }
});

Template.registerHelper("getProfileImage", function (currentUser, size) {
  const user = currentUser || Accounts.user();
  console.log( "getProfileImage | user", user )
  if (!user) return false;

  const profileImage = ReactionCore.Collections.Media.findOne({"metadata.userId": user._id}, {sort: {"metadata.priority": 1}});
  if (profileImage) {
    console.log( "getProfileImage | profile image:", profileImage.url({ store: "thumbnail" }) )
    return profileImage.url({ store: "thumbnail" })
  }
  else {
    return null; //Blaze._globalHelpers.getGravatar(currentUser, size);
  }
});
