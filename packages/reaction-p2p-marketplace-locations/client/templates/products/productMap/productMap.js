
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

function addMarker(map, product) {
  Meteor.call("accounts/getUserAddress", product.userId, true, function(error, result) {
    if (!error && result) {
      let address = result.replace("undefined", "").replace("  ", " ");
      console.log('address', address);

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          'address': address
        },
        function(results, status) {
           if(status == google.maps.GeocoderStatus.OK) {
              console.log("resolved location: "+results[0].geometry.location);

              var marker = new google.maps.Marker({
                 position: results[0].geometry.location,
                 map: map.instance,
                 title: product.title+"\n"+address+"\n"+product.copiedInventoryQuantity+" "+i18next.t('accountsUI.inventoryUnit', {defaultValue: 'pieces'}),
                 animation: google.maps.Animation.DROP,
                 icon: "/packages/scydev_reaction-p2p-marketplace-locations/public/images/icon.png",
                 //icon: getProductImage(product._id).url({store: "thumbnail"})
              });

              var infowindow = new google.maps.InfoWindow({
                content: "Test Info Win" //contentString
              });
              marker.addListener('click', function() {
                console.log("clicked marker: ",map," ",marker);
                //infowindow.open(map, marker);
                ReactionRouter.go("product", {handle: product.handle});
              });

              markers[product._id] = marker;
           }
        }
      );
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
  Tracker.autorun(() => {
    console.log("centerMapToMeaningfulPlace() start");
    let locationSearchResult = Session.get('productFilters/location');
    let locationSearchUserInput = Session.get('productFilters/locationUserInput');

    if (locationSearchUserInput != null && locationSearchResult != null && locationSearchResult != "") {
      locationSearchResult = locationSearchResult.split("/");
      console.log("center map to location search result: ",locationSearchResult);
      map.instance.setCenter(new google.maps.LatLng(locationSearchResult[0], locationSearchResult[1]));
    }
    else {
      console.log("HTML5 geolocation: ",navigator.geolocation);
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("getCurrentPositionn: ",position);

          //infoWindow.setPosition(pos);
          //infoWindow.setContent('Location found.');
          map.setCenter(pos);
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
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
    console.log( "queryParams:", queryParams );
    Meteor.subscribe("Products", Session.get("productScrollLimit"), queryParams);
  });

  this.autorun(() => {
    const isActionViewOpen = ReactionCore.isActionViewOpen();
    if (isActionViewOpen === false) {
      Session.set("productGrid/selectedProducts", []);
    }
  });


  GoogleMaps.ready('map', function(map) {
    //var infoWindow = new google.maps.InfoWindow({map: map});

    ReactionCore.Collections.Products.find().observe({
      added: function(product) {
        // Create a marker for this document
        addMarker(map, product);

        centerMapToMeaningfulPlace(map);
      },
      changed: function(newDocument, oldDocument) {
        markers[newDocument._id].setPosition({ latitude: newDocument.latitude, longitude: newDocument.longitude });
      },
      removed: function(oldDocument) {
        // Remove the marker from the map
        markers[oldDocument._id].setMap(null);

        // Clear the event listener
        google.maps.event.clearInstanceListeners(markers[oldDocument._id]);

        // Remove the reference to this marker instance
        delete markers[oldDocument._id];

        centerMapToMeaningfulPlace(map);
      }
    });

    centerMapToMeaningfulPlace(map.instance);
  });

});
