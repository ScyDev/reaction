
db.getCollection('users').find({}).forEach(function(user) {
  var set = {
    isDecided: false,
    isSeller: false,
    acceptedTerms: false
  };
  if (user.profile != null && user.profile.isDecided != null) {
    set.isDecided = user.profile.isDecided;
  }
  if (user.isSeller != null) {
    set.isSeller = user.isSeller;
  }
  if (user.acceptedTerms != null) {
    set.acceptedTerms = user.acceptedTerms;
  }

  db.Accounts.update({_id:user._id},
    {
      $set: set
    }
  );

});

#############################################

db.getCollection('users').find({}).forEach(function(user) {

  db.users.update({_id:user._id},
    {
      $unset: {
        isSeller: 1,
        "profile.isSeller": 1,
        isDecided: 1,
        "profile.isDecided": 1,
        acceptedTerms: 1,
        "profile.acceptedTerms": 1
      }
    }
  );

});
