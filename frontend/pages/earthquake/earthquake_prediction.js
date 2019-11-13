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

let marker = new mapboxgl.Marker({
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

document.querySelector('#earthquake-prediction-form').addEventListener(
  'submit',
  async (e) => {
    let lngLat = marker.getLngLat();
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
    location.reload();
  },
  true
);

function prefixInteger(num, length) {
  return ('0000000000000000' + num).substr(-length);
}

function date2Str(date) {
  const yyyy = prefixInteger(date.getFullYear(), 4);
  const MM = prefixInteger(date.getMonth() + 1, 2);
  const dd = prefixInteger(date.getDate(), 2);
  return yyyy + '-' + MM + '-' + dd;
}

function time2Str(time) {
  const HH = prefixInteger(time.getHours(), 2);
  const mm = prefixInteger(time.getMinutes(), 2);
  return HH + ':' + mm;
}
