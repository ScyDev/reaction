/**
 * productMap helpers
 */

Template.productMapSingle.onRendered(function () {
  GoogleMaps.load({ key: getGoogleMapsApiKey() });
});

Template.productMapSingle.helpers({
  // products: function () {
  //   return getProductsByTag(this.tag);
  // },
  media: function () {
    let defaultImage;
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
    if (variants.length > 0) {
      let variantId = variants[0]._id;
      defaultImage = ReactionCore.Collections.Media.findOne({
        "metadata.variantId": variantId,
        "metadata.priority": 0
      });
    }
    if (defaultImage) {
      return defaultImage;
    }
    return false;
  },
  mapOptions: function () {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(47.3770309, 8.5077843), // start pos zürich 47.3770309,8.5077843
        zoom: 13,
        reactionTag: this.tag
      };
    }

    return null;
  }
});

Template.productMapSingle.onCreated(function () {
  const handle = ReactionRouter.getParam("handle");
  const product = ReactionCore.Collections.PublicProducts.findOne({ handle }) || ReactionCore.Collections.SellerProducts.findOne({ handle });
  if (!product) return;

  const { location = {} } = product;
  if (!location.lat || !location.lng) return;

  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready("map", map => {
    google.maps.Marker({
      position: location,
      map: map.instance,
      title: product.title,
      animation: google.maps.Animation.DROP
    });
    map.instance.setCenter(location);
  });
});
