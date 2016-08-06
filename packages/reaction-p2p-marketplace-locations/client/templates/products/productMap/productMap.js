
Template.productMap.inheritsHelpersFrom(["productGrid"]);
Template.productMap.inheritsEventsFrom(["productGrid"]);
Template.productMap.inheritsHooksFrom(["productGrid"]);


Template.productMap.onRendered(() => GoogleMaps.load());

Template.productMap.helpers({
  mapOptions: () => {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(47.3770309, 8.5077843), // start pos zürich 47.3770309,8.5077843
        zoom: 13,
        reactionTag: this.tag
      };
    }
  }
});


let markers = {};

function addMarker(map, userId) {
  if (!map || !userId) return;
  console.log("Adding marker for seller", userId);
  Meteor.call("accounts/getUserAddress", userId, true, (error, result) => {
    if (!error && result) {
      const address = result.replace("undefined", "").replace("  ", " ");
      console.log("address:", address);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          console.log("resolved location:", results[0].geometry.location);
          const markerData = markers[userId];

          const marker = new google.maps.Marker({
            position: results[0].geometry.location,
            map: map.instance,
            animation: google.maps.Animation.DROP,
            icon: "/packages/scydev_reaction-p2p-marketplace-locations/public/images/icon.png"
          });
          markerData.marker = marker;

          const infoWindow = new google.maps.InfoWindow();

          /* We need timeout to prevent showing both added and removed products at the same time */
          markerData.update = () => Meteor.setTimeout(() => {
            products = ReactionCore.Collections.Products.find({ userId }, { sort: {latestOrderDate: 1} });

            /* If products count is zero, delete the marker, otherwise update infoWindow content */
            if (products.count() > 0) {
              infoWindow.setContent(Blaze.toHTMLWithData(Template.productMapDetails, {
                products: products.fetch(),
                address: address
              }));
            } else {
              // Remove the marker from the map
              marker.setMap(null);
              // Clear the event listener
              google.maps.event.clearInstanceListeners(marker);
              // Remove the reference to this marker instance
              delete markers[userId];
              console.log("Marker removed", markers);
            }
          }, 500);
          markerData.update();

          let markerIsHovered = false;
          marker.addListener("mouseover", () => {
            markerIsHovered = true;
            Meteor.setTimeout(() => { if (markerIsHovered) infoWindow.open(map, marker) }, 1000);
          });
          marker.addListener( 'click', () => {
            markerIsHovered = true;
            infoWindow.open(map, marker);
          } );
          marker.addListener("mouseout", () => markerIsHovered = false);
          map.instance.addListener("click", () => infoWindow.close());
        }
      });
    }
  });
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
    let locationSearchResult = Session.get("productFilters/location");
    const locationSearchUserInput = Session.get("productFilters/locationUserInput");
    const geoPosition = Session.get("geoPosition");

    if (locationSearchUserInput != null && locationSearchResult != null && locationSearchResult !== "") {
      locationSearchResult = locationSearchResult.split("/");
      console.log("Center map to location search result:", locationSearchResult);
      map.setCenter(new google.maps.LatLng(locationSearchResult[0], locationSearchResult[1]));
    } else if (geoPosition) {
      map.setCenter(geoPosition);
    }
  });
}

Template.productMap.onCreated(function() {
  Session.set("productGrid/selectedProducts", []); // Why do we need it here?

  GoogleMaps.ready("map", map => {
    markers = {};
    /* Track the current set of filters and rerun Products observationto catch the 'added' events. */
    Tracker.autorun(() => {
      ReactionCore.Collections.Products.find(Session.get("productFilters")).observe({
        added: product => {
          // console.log("Products observer: added", product);
          const markerData = markers[product.userId];
          /* Create a marker for this seller if it does not exist,
             update the products counter for marker if it does
          */
          if (markerData) {
            /* Right after adding the first product for seller, it's marker is not ready yet */
            if (markerData.update) {
              markerData.update();
              console.log("Marker updated", markers);
            }
          } else {
            markers[product.userId] = {};
            addMarker(map, product.userId);
            console.log("Marker added", markers);
          }
        },
        changed: product => {
          // console.log("Products observer: changed", product);
          const markerData = markers[product.userId];
          markerData.update();
          // commented as 'Products' do not have lat/lon
          // markerData.marker.setPosition({ latitude: product.latitude, longitude: product.longitude });
        }
      });
    });
    /* Run another observer to catch all the 'deleted' events */
    ReactionCore.Collections.Products.find().observe({
      removed: product => {
        // console.log("Products observer: removed", product);
        if (!product) return;
        const markerData = markers[product.userId];
        if (!markerData) return;
        markerData.update();
      }
    });

    centerMapToMeaningfulPlace(map.instance);
  });
});
