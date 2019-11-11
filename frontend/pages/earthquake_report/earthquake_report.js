import userStore from '../../store/user.js';
import earthquakeReportApis from '../../apis/earthquake-report-apis.js';

if (userStore.userGetters.isLogin) {
  document.querySelector('#join-community-button').style.display = 'none';
  document.querySelector('#welcome-message').innerText = `Welcome, ${
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
    let coordinates = document.querySelector('#coordinates');
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

const currentDate = new Date();
const yyyy = String(currentDate.getFullYear());
const mm =
  currentDate.getMonth() + 1 < 10
    ? '0' + String(currentDate.getMonth() + 1)
    : String(currentDate.getMonth() + 1);
const dd =
  currentDate.getDate() < 10
    ? '0' + String(currentDate.getDate())
    : String(currentDate.getDate());
document.querySelector('#date-input').value = yyyy + '-' + mm + '-' + dd;
const HH =
  currentDate.getHours() < 10
    ? '0' + String(currentDate.getHours())
    : String(currentDate.getHours());
const MM =
  currentDate.getMinutes() < 10
    ? '0' + String(currentDate.getMinutes())
    : String(currentDate.getMinutes());
document.querySelector('#time-input').value = HH + ':' + MM;

// Event Listener
document.querySelector('#earthquake-report-form').addEventListener(
  'submit',
  (e) => {
    let lngLat = marker.getLngLat();
    let report = {
      occurred_datetime: new Date(
        document.querySelector('#date-input').value +
          'T' +
          document.querySelector('#time-input').value
      ),
      description: document.querySelector('#description-input').value,
      magnitude: Number(document.querySelector('#magnitude-input').value),
      location: { longitude: lngLat.lng, latitude: lngLat.lat },
      killed: Number(document.querySelector('#killed-input').value),
      injured: Number(document.querySelector('#injured-input').value),
      missing: Number(document.querySelector('#missing-input').value),
    };
    if (report.description.split(' ').length > 25) {
      alert('Description max 25 words!');
      return;
    }
    console.log(report);
    earthquakeReportApis.postEarthquakeReport(report);
  },
  true
);
