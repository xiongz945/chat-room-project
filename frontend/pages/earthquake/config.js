export const barOptions = {
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

export const pie_chart_options = {
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
};
