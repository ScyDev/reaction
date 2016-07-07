Template.itemSeller.onCreated(function() {
  this.itemSellerNameAddressPhone = new ReactiveVar("");
  //console.log("created ReactiveVar itemSellerNameAddressPhone");
});

Template.registerHelper("itemSellerNameAddressPhone", function (sellerId) {
  //console.log("itemSellerNameAddressPhone() sellerId: ",sellerId);
  let templateInstance = Template.instance();

  Meteor.call("accounts/getUserNameAddressPhone", sellerId, function(error, result) {
    //console.log("accounts/getUserNameAddressPhone() result: ",result," error: ",error);
    if (!error && result) {
      templateInstance.itemSellerNameAddressPhone.set(result.replace("undefined", "").replace("  ", " "));
    }
  });

  return Template.instance().itemSellerNameAddressPhone.get();
});
