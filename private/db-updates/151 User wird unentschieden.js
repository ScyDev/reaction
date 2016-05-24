
var adminId = db.getCollection('users').findOne({'emails.address': 'c7i2sbtw@localhost'}, {_id: 1});

db.getCollection('users').find({_id: {$ne: adminId._id}}).forEach(function(user) {
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

var adminId = db.getCollection('users').findOne({'emails.address': 'c7i2sbtw@localhost'}, {_id: 1});

db.getCollection('users').find({_id: {$ne: adminId._id}}).forEach(function(user) {

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
