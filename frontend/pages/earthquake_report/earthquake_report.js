import userStore from '../../store/user.js';

if (userStore.userGetters.isLogin) {
  document.getElementById('join-community-button').style.display = 'none';
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
}

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FueCIsImEiOiJjazJzbTZ2eGMwbXMyM2JsN3VwZzlpOTIyIn0.M0NE8kywhhrC1pDQ9j_kww';
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

let marker = new mapboxgl.Marker({
  draggable: true,
});

map.on('load', function() {
  navigator.geolocation.getCurrentPosition((position) => {
    const userCoordinates = [
      position.coords.longitude,
      position.coords.latitude,
    ];
    map.addSource('user-coordinates', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: userCoordinates,
        },
      },
    });
    map.addLayer({
      id: 'user-coordinates',
      source: 'user-coordinates',
      type: 'circle',
    });

    map.flyTo({
      center: userCoordinates,
      zoom: 14,
    });
    marker.setLngLat(userCoordinates).addTo(map);
    let coordinates = document.getElementById('coordinates');
    coordinates.innerHTML =
      'Longitude: ' +
      userCoordinates[0] +
      '<br />Latitude: ' +
      userCoordinates[1];
    function onDragEnd() {
      let lngLat = marker.getLngLat();
      // coordinates.style.display = 'block';
      coordinates.innerHTML =
        'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    }
    marker.on('dragend', onDragEnd);
  });
});
