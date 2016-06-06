
Template.productMap.inheritsHelpersFrom(["productGrid"]);
Template.productMap.inheritsEventsFrom(["productGrid"]);
Template.productMap.inheritsHooksFrom(["productGrid"]);


Template.productMap.onRendered(function() {
  GoogleMaps.load();
});

let Media;
Media = ReactionCore.Collections.Media;
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
  if( !map || !userId ) return;
  console.log( "Adding marker for seller", userId )
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
          marker.productsCount = 1;

          const contentString = Blaze.toHTMLWithData(Template.productMapDetails, {
            products: ReactionCore.Collections.Products.find({ userId }, { sort: {latestOrderDate: 1} }).fetch()
          });
          // console.log( "infoWindow:", contentString );
          const infoWindow = new google.maps.InfoWindow({ content: contentString });
          marker.addListener( 'mouseover', () => { infoWindow.close(); infoWindow.open(map, marker) } );
          map.instance.addListener( 'click', () => infoWindow.close() );

          markers[userId].marker = marker;
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
    navigator.geolocation.getCurrentPosition( position => {
      Session.set("geoPosition", {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      console.log("getCurrentPositionn: ", position);
    } );
  }

  Tracker.autorun(() => {
    console.log("centerMapToMeaningfulPlace() start");
    let locationSearchResult = Session.get('productFilters/location');
    let locationSearchUserInput = Session.get('productFilters/locationUserInput');
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
  this.autorun(() => {
    const slug = ReactionRouter.getParam("slug");
    const { Tags } = ReactionCore.Collections;
    const tag = Tags.findOne({ slug: slug }) || Tags.findOne(slug);
    let tags = {}; // this could be shop default implementation needed
    if (tag) {
      tags = {tags: [tag._id]};
    }

    let dateFilter = { forSaleOnDate: Session.get('productFilters/forSaleOnDate') }
    if (dateFilter.forSaleOnDate == null || dateFilter.forSaleOnDate.toString() == "Invalid Date") {
      dateFilter = {};
    }
    let locationFilter = { location: Session.get('productFilters/location') }
    if (locationFilter.location == null || locationFilter.location.trim() == "") {
      locationFilter = {};
    }
    const mealTimeFilter = { mealTime: Session.get('productFilters/mealTime') }

    const queryParams = Object.assign({}, tags, ReactionRouter.current().queryParams, dateFilter, locationFilter, mealTimeFilter);
    Meteor.subscribe("Products", Session.get("productScrollLimit"), queryParams);
  });

  this.autorun(() => {
    const isActionViewOpen = ReactionCore.isActionViewOpen();
    if (isActionViewOpen === false) {
      Session.set("productGrid/selectedProducts", []);
    }
  });


  GoogleMaps.ready('map', function(map) {
    markers = [];
    ReactionCore.Collections.Products.find().observe({
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
        let marker = markers[oldDocument.userId].marker;
        if( !marker ) return;
        marker.productsCount--;
        // Check if it is the last product for this seller
        if( marker.productsCount < 1 ) {
          // Remove the marker from the map
          marker.setMap(null);
          // Clear the event listener
          google.maps.event.clearInstanceListeners(marker);
          // Remove the reference to this marker instance
          delete marker;
          
          // centerMapToMeaningfulPlace(map);
        }
      }
    });

    centerMapToMeaningfulPlace(map.instance);
  });

});
