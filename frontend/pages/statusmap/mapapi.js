var icons = {
  OK: {
    icon: '../../../assets/img/green.png',
  },
  Help: {
    icon: '../../../assets/img/yellow.png',
  },
  Emergency: {
    icon: '../../../assets/img/red.png',
  },
};

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'),
    { types: ['geocode'] }
  );
  autocomplete.setFields(['name', 'place_id']);

  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    document.getElementById('placeID').value = place.place_id;
  });
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy,
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

var map;

function initMap() {
  var center = { lat: 37.39, lng: -122.08 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 8,
  });
  infoWindow = new google.maps.InfoWindow();

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(pos);
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? 'Error: The Geolocation service failed.'
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function updateMap(payload) {
  let username = payload['name'];
  let userstatus = payload['status'];
  let userplaceID = payload['placeid'];
  let userdesc = payload['desc'];
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ placeId: userplaceID }, function(results, status) {
    if (status !== 'OK') {
      window.alert('Geocoder failed due to: ' + status);
      return;
    }
    console.log(userstatus);
    var marker_icon;
    if (userstatus === 'OK') {
      marker_icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (userstatus === 'Help') {
      marker_icon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    } else if (userstatus === 'Emergency') {
      marker_icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }

    var marker = new google.maps.Marker({
      map: map,
      place: {
        placeId: userplaceID,
        location: results[0].geometry.location,
      },
      icon: {
        url: marker_icon,
      },
    });

    marker.setVisible(true);
  });
}
