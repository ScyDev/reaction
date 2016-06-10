
Template.productMap.inheritsHelpersFrom(["productGrid"]);
Template.productMap.inheritsEventsFrom(["productGrid"]);
Template.productMap.inheritsHooksFrom(["productGrid"]);


Template.productMap.onRendered(function() {
  GoogleMaps.load();
});

let Media = ReactionCore.Collections.Media;
Template.productMap.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(47.3770309, 8.5077843), // start pos zürich 47.3770309,8.5077843
        zoom: 13,
        reactionTag: this.tag
      };
    }
  }
});

var markers = {};

function addMarker(map, userId) {
  if (!map || !userId) return;
  console.log("Adding marker for seller", userId);
  Meteor.call("accounts/getUserAddress", userId, true, function(error, result) {
    if (!error && result) {
      const address = result.replace("undefined", "").replace("  ", " ");
      console.log('address:', address);

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { address }, function(results, status) {
       if(status == google.maps.GeocoderStatus.OK) {
          console.log("resolved location: ", results[0].geometry.location);

          const marker = new google.maps.Marker({
             position: results[0].geometry.location,
             map: map.instance,
             animation: google.maps.Animation.DROP,
             icon: "/packages/scydev_reaction-p2p-marketplace-locations/public/images/icon.png",
          });
          markers[userId].marker = marker;

          const contentString = Blaze.toHTMLWithData(Template.productMapDetails, {
            products: ReactionCore.Collections.Products.find({ userId }, { sort: {latestOrderDate: 1} }).fetch()
          });
          // console.log( "infoWindow:", contentString );
          const infoWindow = new google.maps.InfoWindow({ content: contentString });
          let markerIsHovered = false;
          marker.addListener( 'mouseover', () => {
            markerIsHovered = true;
            Meteor.setTimeout( () => { if( markerIsHovered ) infoWindow.open(map, marker) }, 1000 );
          } );
          marker.addListener( 'mouseout', () => markerIsHovered = false );
          map.instance.addListener( 'click', () => infoWindow.close() );

       }
      } );
    }
  });
}

function getProductImage(productId) {
  const media = ReactionCore.Collections.Media.findOne({
    "metadata.productId": productId,
    "metadata.priority": 0,
    "metadata.toGrid": 1
  }, { sort: { uploadedAt: 1 } });

  //console.log("media for product ",productId," ",media);
  //console.log("thumbnail for product ",productId," ",media.getCopyInfo("thumbnail"));

  return media;
}

function centerMapToMeaningfulPlace(map) {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log("Current position: ", position);
        Session.set("geoPosition", {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      e => console.log("Failed to get current position:", e.message)
    );
  }

  Tracker.autorun(() => {
    console.log("Meaningful place changed.");
    let locationSearchResult = Session.get('productFilters/location');
    const locationSearchUserInput = Session.get('productFilters/locationUserInput');
    const geoPosition = Session.get('geoPosition');

    if( locationSearchUserInput != null && locationSearchResult != null && locationSearchResult != "" ) {
      locationSearchResult = locationSearchResult.split("/");
      console.log("Center map to location search result: ",locationSearchResult);
      map.setCenter(new google.maps.LatLng(locationSearchResult[0], locationSearchResult[1]));
    } else if( geoPosition )
      map.setCenter(geoPosition);
  });
}

Template.productMap.onCreated(function() {
  // copied from productGrid

  Session.set("productGrid/selectedProducts", []);
  // Update product subscription
  // this.autorun(() => applyProductFilters());

  GoogleMaps.ready('map', function(map) {
    markers = [];
    ReactionCore.Collections.Products.find(Session.get("productFilters")).observe({
      added: product => {
        // Create a marker for this seller if it does not exist
        if( markers[product.userId] ) markers[product.userId].productsCount++
        else {
          markers[product.userId] = { productsCount: 1 };
          addMarker(map, product.userId);
        }
        // centerMapToMeaningfulPlace(map);
      },
      changed: (newDocument, oldDocument) =>
        markers[newDocument.userId].marker.setPosition({ latitude: newDocument.latitude, longitude: newDocument.longitude }),
      removed: function(oldDocument) {
        const markerData = markers[oldDocument.userId];
        if( !markerData ) return;
        markerData.productsCount--;
        // Check if it is the last product for this seller
        if( markerData.productsCount < 1 ) {
          if( markerData.marker ) {
            // Remove the marker from the map
            markerData.marker.setMap(null);
            // Clear the event listener
            google.maps.event.clearInstanceListeners(markerData.marker);
          }
          // Remove the reference to this marker instance
          delete markers[oldDocument.userId];

          // centerMapToMeaningfulPlace(map);
        }
      }
    });

    centerMapToMeaningfulPlace(map.instance);
  });

});
