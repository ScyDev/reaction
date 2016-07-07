
Template.locationFieldDisplay.onCreated(function() {
  this.locationForProduct = new ReactiveVar("");
  //console.log("created ReactiveVar locationForProduct");
});

Template.registerHelper("locationForProduct", function (product) {
  console.log("locationForProduct() product: ",product);
  let templateInstance = Template.instance();

  if (templateInstance.locationForProduct == null) {
    templateInstance.locationForProduct = new ReactiveVar("");
  }

  console.log("product.userId:",product.userId);
  if (product.userId != null) {
    Meteor.call("accounts/getUserAddress", product.userId, false, function(error, result) {
      console.log("accounts/getUserAddress() result: ",result," error: ",error);
      if (!error && result) {
        templateInstance.locationForProduct.set(result.replace("undefined", "").replace("  ", " "));
      }
    });
  }

  return templateInstance.locationForProduct.get();
  
});
