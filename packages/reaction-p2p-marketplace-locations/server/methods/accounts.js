/*
function resolveAddressToLatLong(address) {
  ReactionCore.Log.info("resolveAddressToLatLong() address: ",address);

  // doesn't work on client. need server side geocoding API.
  GoogleMaps.ready('map', function(map) {
    let addressString = address.address1+" "+address.address2+", "+address.postal+" "+address.city+", "+address.country;
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      {
        'address': addressString
      },
      function(results, status) {
         if(status == google.maps.GeocoderStatus.OK) {

            console.log("resolved location: "+results[0].geometry.location);
         }
      }
    );
  });

  GoogleMaps.load();
}

// hook into: "accounts/addressBookAdd": function (address, accountUserId)
ReactionCore.MethodHooks.after("accounts/addressBookAdd",
  function(options) {
    ReactionCore.Log.info("HOOK: accounts/addressBookAdd ",options);

    var address = options.arguments[0];
    resolveAddressToLatLong(address);

    // To be safe, return the options.result in an after hook.
    return options.result;
  }
);
// hook into: "accounts/addressBookUpdate": function (address, accountUserId, type)
ReactionCore.MethodHooks.after("accounts/addressBookUpdate",
  function(options) {
    ReactionCore.Log.info("HOOK: accounts/addressBookUpdate ",options);

    var address = options.arguments[0];
    resolveAddressToLatLong(address);

    // To be safe, return the options.result in an after hook.
    return options.result;
  }
);
*/

this.getUserAddress = (userId, addCountry = false) => {
  check(userId, Match.Optional(String, null));
  check(addCountry, Boolean);

  const account =  ReactionCore.Collections.Accounts.findOne({ userId });
  //ReactionCore.Log.info("User address book:", account.profile.addressBook);

  if (account != null && account.profile.addressBook != null && account.profile.addressBook.length > 0) {
    const address = account.profile.addressBook[0];
    let addressString = address.address1 + " " + address.address2 + ", " + address.postal + " " + address.city;
    if (addCountry) addressString = addressString + ", " + address.country;

    // ReactionCore.Log.info("User address string:", addressString);
    return addressString.replace("undefined", "").replace(/\s+/g, " ").replace(/\s+,/g, " ");
  }

  return null;
}

Meteor.methods({
    "accounts/getUserAddress": (userId, addCountry) => getUserAddress(userId, addCountry),
});
