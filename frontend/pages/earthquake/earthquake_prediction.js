import userStore from '../../store/user.js';
import earthquakeApis from '../../apis/earthquake-apis.js';

if (userStore.userGetters.isLogin) {
  document.querySelector('#join-community-button').style.display = 'none';
  document.querySelector('#welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
}

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FueCIsImEiOiJjazJzbTZ2eGMwbXMyM2JsN3VwZzlpOTIyIn0.M0NE8kywhhrC1pDQ9j_kww';

let predictionMap = new mapboxgl.Map({
  container: 'prediction-map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

predictionMap.on('load', () => {
  let coordinates = predictionMap._container.firstElementChild;
  navigator.geolocation.getCurrentPosition((position) => {
    const userCoordinates = [
      position.coords.longitude,
      position.coords.latitude,
    ];
    predictionMap.addSource(coordinates.id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: userCoordinates,
        },
      },
    });
    predictionMap.addLayer({
      id: coordinates.id,
      source: coordinates.id,
      type: 'circle',
    });

    predictionMap.jumpTo({
      center: userCoordinates,
      zoom: 14,
    });
    let marker = new mapboxgl.Marker({
      draggable: true,
    });
    marker.setLngLat(userCoordinates).addTo(predictionMap);
    coordinates.innerHTML =
      'Longitude: ' +
      userCoordinates[0] +
      '<br />Latitude: ' +
      userCoordinates[1];

    function onDragEnd() {
      let lngLat = marker.getLngLat();
      coordinates.innerHTML =
        'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    }

    marker.on('dragend', onDragEnd);
  });
});
