import userStore from '../../store/user.js';
import earthquakeApis from '../../apis/earthquake-apis.js';
import { API_ROOT } from '../../config.js';
import {date2Str, time2Str} from './utils/utils.js';

// Show welcome message
if (userStore.userGetters.isLogin) {
  document.querySelector('#join-community-button').style.display = 'none';
  document.querySelector('#welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
}

//Set up socket
const socket = io(API_ROOT);

// Set Mapbox token
mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FueCIsImEiOiJjazJzbTZ2eGMwbXMyM2JsN3VwZzlpOTIyIn0.M0NE8kywhhrC1pDQ9j_kww';

// Load map
let predictionMap = new mapboxgl.Map({
  container: 'prediction-map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

// Add marker in map
export const prediction_marker = new mapboxgl.Marker({
  draggable: true,
});

// Set current datetime to input
const currentDate = new Date();
document.querySelector('#date-input').value = date2Str(currentDate);
document.querySelector('#time-input').value = time2Str(currentDate);

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
    prediction_marker.setLngLat(userCoordinates).addTo(predictionMap);
    coordinates.innerHTML =
      'Longitude: ' +
      userCoordinates[0] +
      '<br />Latitude: ' +
      userCoordinates[1];

    function onDragEnd() {
      let lngLat = prediction_marker.getLngLat();
      coordinates.innerHTML =
        'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    }

    prediction_marker.on('dragend', onDragEnd);
  });
});

document.querySelector('#earthquake-prediction-form').addEventListener(
  'submit',
  async (e) => {
    let lngLat = prediction_marker.getLngLat();
    let prediction = {
      occurred_datetime: new Date(
        document.querySelector('#date-input').value +
          'T' +
          document.querySelector('#time-input').value
      ),
      description: document.querySelector('#description-input').value,
      magnitude: Number(document.querySelector('#magnitude-input').value),
      location: {
        longitude: lngLat.lng,
        latitude: lngLat.lat,
      },
    };
    if (prediction.description.split(' ').length > 25) {
      alert('Description max 25 words!');
      return;
    }
    const resp = await earthquakeApis.postEarthquakePrediction(prediction);
    if (resp.status === 401) {
      alert("You don't have the authorization!");
    }
    if (resp.status === 200) {
      prediction['predictorName'] = userStore.userGetters.user().username;
      socket.emit('NOTIFY_NEW_PREDICTION', prediction);
    }
    location.reload();
  },
  true
);
