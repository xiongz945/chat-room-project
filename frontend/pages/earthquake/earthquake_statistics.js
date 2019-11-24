import userStore from '../../store/user.js';
import earthquakeApis from '../../apis/earthquake-apis.js';

// Show welcome message
if (userStore.userGetters.isLogin) {
  document.querySelector('#join-community-button').style.display = 'none';
  document.querySelector('#welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
}

// Display earthquake prediction menu when the user is coordinator
if (userStore.userGetters.user().role === 'coordinator') {
  document.querySelector(
    '#menu-prediction'
  ).parentElement.parentElement.hidden = false;
}

let reports;
let allLoadedReportID = [];
receiveEarthquakeReports();

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FueCIsImEiOiJjazJzbTZ2eGMwbXMyM2JsN3VwZzlpOTIyIn0.M0NE8kywhhrC1pDQ9j_kww';

let statisticsMap = new mapboxgl.Map({
  container: 'statistics-map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

statisticsMap.on('load', () => {
  statisticsMap.jumpTo({
    center: [-97, 39],
    zoom: 2,
  });
  if (reports) showLocationStatistics(reports);
});

document
  .querySelector('#statistics-range-form')
  .addEventListener('submit', (e) => {
    let date_from = document.querySelector('#date-from').value,
      date_to = document.querySelector('#date-to').value;
    if (date_to < date_from) {
      alert('Date range is wrong.');
      return;
    }
    date_from = str2Date(date_from);
    date_to = str2Date(date_to);
    let reportsInRange = [];
    reports.forEach((report) => {
      const reportDate = new Date(report['occurred_datetime']);
      reportDate.setHours(0);
      reportDate.setMinutes(0);
      reportDate.setSeconds(0);
      reportDate.setMilliseconds(0);
      if (reportDate >= date_from && reportDate <= date_to) {
        reportsInRange.push(report);
      }
    });
    showEarthquakeCount(reportsInRange);
    showMagnitudeStatistics(reportsInRange);
    showLocationStatistics(reportsInRange);
    showCasualtyStatistics(reportsInRange);
  });

function showEarthquakeCount(reports) {
  document.querySelector('#earthquake-count').innerText = reports.length;
}

function showCasualtyStatistics(reports) {
  let killedCnt = 0,
    injuredCnt = 0,
    missingCnt = 0;
  reports.forEach((report) => {
    killedCnt += report['killed'];
    injuredCnt += report['injured'];
    missingCnt += report['missing'];
  });
  let casualtyCnt = killedCnt + injuredCnt + missingCnt;
  const data = [
    {
      label: 'Killed',
      data: (killedCnt / casualtyCnt) * 100,
      color: '#79d2c0',
    },
    {
      label: 'Injured',
      data: (injuredCnt / casualtyCnt) * 100,
      color: '#00BFFF',
    },
    {
      label: 'Missing',
      data: (missingCnt / casualtyCnt) * 100,
      color: '#d3d3d3',
    },
  ];

  $.plot($('#casualty-pie-chart'), data, {
    series: {
      pie: {
        show: true,
      },
    },
    grid: {
      hoverable: true,
    },
    tooltip: true,
    tooltipOpts: {
      content: '%p.0%, %s',
      shifts: {
        x: 20,
        y: 0,
      },
      defaultTheme: false,
    },
  });
}

function showLocationStatistics(reports) {
  allLoadedReportID.forEach((reportID) => {
    statisticsMap.removeLayer(reportID);
    statisticsMap.removeSource(reportID);
  });
  allLoadedReportID.length = 0;
  reports.forEach((report) => {
    const reportID = report._id;
    const coordinates = [
      report['location']['longitude'],
      report['location']['latitude'],
    ];
    allLoadedReportID.push(reportID);
    statisticsMap.addSource(reportID, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
      },
    });
    statisticsMap.addLayer({
      id: reportID,
      source: reportID,
      type: 'circle',
      paint: {
        'circle-radius': 2,
        'circle-color': 'red',
      },
    });
  });
}

function showMagnitudeStatistics(reports) {
  const barOptions = {
    series: {
      bars: {
        show: true,
        barWidth: 0.6,
        fill: true,
        fillColor: {
          colors: [
            {
              opacity: 0.8,
            },
            {
              opacity: 0.8,
            },
          ],
        },
      },
    },
    xaxis: {
      ticks: [[1, '<4.0'], [2, '<6.0'], [3, '<8.0'], [4, '>=8.0']],
    },
    colors: ['#1ab394'],
    grid: {
      color: '#999999',
      hoverable: true,
      clickable: true,
      tickColor: '#D4D4D4',
      borderWidth: 0,
    },
    legend: {
      show: true,
    },
    tooltip: true,
    tooltipOpts: {
      content: 'y: %y',
    },
  };
  let magnitudeIntervals = [0, 0, 0, 0];
  reports.forEach((report) => {
    let m = report['magnitude'];
    if (m < 4.0) ++magnitudeIntervals[0];
    else if (m < 6.0) ++magnitudeIntervals[1];
    else if (m < 8.0) ++magnitudeIntervals[2];
    else ++magnitudeIntervals[3];
  });
  const barData = {
    label: 'Magnitude',
    data: [
      [1, magnitudeIntervals[0]],
      [2, magnitudeIntervals[1]],
      [3, magnitudeIntervals[2]],
      [4, magnitudeIntervals[3]],
    ],
  };
  $.plot($('#magnitude-bar-chart'), [barData], barOptions);
}

async function receiveEarthquakeReports() {
  const resp = await earthquakeApis.getEarthquakeReport();
  reports = resp['data']['reports'];
  showEarthquakeCount(reports);
  showMagnitudeStatistics(reports);
  showCasualtyStatistics(reports);
}

function str2Date(dateStr) {
  const yearMonthDay = dateStr.split('-');
  return new Date(
    Number(yearMonthDay[0]),
    Number(yearMonthDay[1]) - 1,
    Number(yearMonthDay[2])
  );
}
