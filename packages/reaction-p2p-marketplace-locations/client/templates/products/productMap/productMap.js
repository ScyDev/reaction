
Template.productMap.inheritsHelpersFrom(["marketplaceProductGrid"]);
Template.productMap.inheritsEventsFrom(["marketplaceProductGrid"]);
Template.productMap.inheritsHooksFrom(["marketplaceProductGrid"]);

const filtersAccessor = "publicProducts";
const collection = ReactionCore.Collections.PublicProducts;

Template.productMap.onRendered(() => GoogleMaps.load({ key: getGoogleMapsApiKey() }));

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

function addMarker(map, product) {
  if (!map || !product) return;
  const { location, userId } = product
  if (!location || !location.lat || !location.lng) return
  // console.log("Adding marker for seller", userId);

  const markerData = markers[userId];

  const marker = new google.maps.Marker({
    position: location,
    map: map.instance,
    animation: google.maps.Animation.DROP,
    icon: "/packages/scydev_reaction-p2p-marketplace-locations/public/images/icon.png"
  });
  markerData.marker = marker;

  const infoWindow = new google.maps.InfoWindow();

  /* We need timeout to prevent showing both added and removed products at the same time */
  markerData.update = () => Meteor.setTimeout(() => {
    const products = collection.find({ ...Session.get(`${filtersAccessor}/selector`), userId }, { sort: {latestOrderDate: 1} });

    /* If products count is zero, delete the marker, otherwise update infoWindow content */
    if (products.count() > 0) {
      infoWindow.setContent(Blaze.toHTMLWithData(Template.productMapDetails, {
        products: products.fetch(),
        address: location.address,
      }));
    } else {
      // Remove the marker from the map
      marker.setMap(null);
      // Clear the event listener
      google.maps.event.clearInstanceListeners(marker);
      // Remove the reference to this marker instance
      delete markers[userId];
      // console.log("Marker removed", markers);
    }
  }, 500);
  markerData.update();

  /* Manage hovers/clicks on marker */
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

function centerMapToMeaningfulPlace(template, map) {
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

  template.autorun(() => {
    console.log("Meaningful place changed.");
    let locationSearchResult = Session.get(`${filtersAccessor}/filters/location`);
    const locationSearchUserInput = Session.get(`${filtersAccessor}/filters/locationUserInput`);
    const geoPosition = Session.get("geoPosition");

    if (locationSearchUserInput && locationSearchResult && locationSearchResult !== "") {
      locationSearchResult = locationSearchResult.split("/");
      console.log("Center map to location search result:", locationSearchResult);
      map.setCenter(new google.maps.LatLng(locationSearchResult[0], locationSearchResult[1]));
    } else if (geoPosition) {
      map.setCenter(geoPosition);
    }
  });
}

Template.productMap.onCreated(function() {
  const self = this;
  initializeViewData(self, "publicProducts", filtersAccessor, 0);
  GoogleMaps.ready("map", map => {
    markers = {};
    /* Track the current set of filters and rerun Products observation. */
    self.autorun(() => {
      Object.keys(markers).map(key => markers[key].update());
      collection.find(Session.get(`${filtersAccessor}/selector`)).observe({
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
              // console.log("Marker updated", markers);
            }
          } else {
            markers[product.userId] = {};
            addMarker(map, product);
            // console.log("Marker added", markers);
          }
        },
        changed: product => {
          // console.log("Products observer: changed", product);
          const markerData = markers[product.userId];
          markerData.update();
          markerData.marker.setPosition({ latitude: product.location.lat, longitude: product.location.lng });
        },
        removed: product => {
          // console.log("Products observer: removed", product);
          if (!product) return;
          const markerData = markers[product.userId];
          if (!markerData) return;
          markerData.update();
        },
      });
    });

    centerMapToMeaningfulPlace(self, map.instance);
  });
});
