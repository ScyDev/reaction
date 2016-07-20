
Template.marketplaceAddressBookForm.replaces("addressBookForm");

Template.addressBookForm.helpers({
  autoselectCountry: function () {
    let packageData = ReactionCore.Collections.Packages.findOne({
      name: "reaction-p2p-marketplace",
      shopId: ReactionCore.getShopId()
    });

    console.log("checking autoselect_country ",packageData);
    if (packageData && packageData.settings && packageData.settings.public.autoselect_country) {
      console.log("autoselect_country is true");
      return true;
    }
    console.log("autoselect_country is false");
    return false;
  }
});
