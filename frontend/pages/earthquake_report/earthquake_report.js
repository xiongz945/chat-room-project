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

let reportMap = new mapboxgl.Map({
  container: 'report-map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

let updateMap = new mapboxgl.Map({
  container: 'update-map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

let locationDict = {};
let markerDict = {};

// Set current datetime to input
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

// Get all reports
let reports;
let reportDict = {};
receiveEarthquakeReports();

// Event Listener
async function updateBtnClickListener(event) {
  const updateReportBtn = event.srcElement;
  const reportId = updateReportBtn.parentElement.parentElement.id;
  $('#myModal').modal('show');
}

document.querySelector('#earthquake-report-form').addEventListener(
  'submit',
  (e) => {
    const mapID = e.srcElement.id.split('-')[1] + '-map';
    let lngLat = {
      lng: locationDict[mapID]['longitude'],
      lat: locationDict[mapID]['latitude'],
    };
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
    earthquakeReportApis.postEarthquakeReport(report);
  },
  true
);

function mapLoadedListener(event) {
  let map = event.target;
  let coordinates = map._container.firstElementChild;
  navigator.geolocation.getCurrentPosition((position) => {
    const userCoordinates = [
      position.coords.longitude,
      position.coords.latitude,
    ];
    locationDict[map._container.id] = {
      longitude: userCoordinates[0],
      latitude: userCoordinates[1],
    };
    map.addSource(coordinates.id, {
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
      id: coordinates.id,
      source: coordinates.id,
      type: 'circle',
    });

    map.flyTo({
      center: userCoordinates,
      zoom: 14,
    });
    let marker = new mapboxgl.Marker({
      draggable: true,
    });
    markerDict[map._container.id] = marker;
    marker.setLngLat(userCoordinates).addTo(map);
    coordinates.innerHTML =
      'Longitude: ' +
      userCoordinates[0] +
      '<br />Latitude: ' +
      userCoordinates[1];
    function onDragEnd() {
      let lngLat = marker.getLngLat();
      locationDict[map._container.id] = {
        longitude: lngLat.lng,
        latitude: lngLat.lat,
      };
      coordinates.innerHTML =
        'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    }
    marker.on('dragend', onDragEnd);
  });
}

reportMap.on('load', mapLoadedListener);
updateMap.on('load', mapLoadedListener);

// functions

async function receiveEarthquakeReports() {
  const resp = await earthquakeReportApis.getEarthquakeReport();
  reports = resp['data']['reports'];
  reports.forEach((report) => {
    reportDict[report['_id']] = report;
  });
  updateReportTable(reports);
  document.querySelectorAll('.update-report-btn').forEach((updateReportBtn) => {
    updateReportBtn.addEventListener('click', updateBtnClickListener);
  });
}

function updateReportTable(reports) {
  const reportTable = document.querySelector('#report-table');
  let i = 1;
  let me = userStore.userGetters.user();
  reports.forEach((report) => {
    const row = document.createElement('tr');
    row.id = report['_id'];
    const numCol = document.createElement('td');
    numCol.innerText = i;
    const datetimeCol = document.createElement('td');
    let datetime = new Date(report['occurred_datetime']);
    datetimeCol.innerText = datetime.toLocaleString();
    const desCol = document.createElement('td');
    desCol.innerText = report['description'];
    let updateCol = document.createElement('td');
    if (report['reporterName'] === me.username) {
      let updateBtn = document.createElement('button');
      updateBtn.className = 'btn btn-sm btn-primary update-report-btn';
      updateBtn.innerText = 'Update';
      updateCol.appendChild(updateBtn);
    }
    row.appendChild(numCol);
    row.appendChild(datetimeCol);
    row.appendChild(desCol);
    row.appendChild(updateCol);
    reportTable.appendChild(row);
    ++i;
  });
}
