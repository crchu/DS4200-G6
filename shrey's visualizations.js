const xLabels = ['Age', 'Height', 'Weight', 'Points', 'Rebounds', 'Assists', 'Draft Year', 'Draft Round'];
const yLabels = ['Age', 'Height', 'Weight', 'Points', 'Rebounds', 'Assists', 'Draft Year', 'Draft Round'];

const zValues = [
    [1, 0.7, 0.5, 0.8, 0.6, 0.4, -0.3, -0.5],
    [0.7, 1, 0.8, 0.6, 0.5, 0.3, -0.4, -0.6],
    [0.5, 0.8, 1, 0.7, 0.4, 0.2, -0.3, -0.4],
    [0.8, 0.6, 0.7, 1, 0.6, 0.5, -0.5, -0.6],
    [0.6, 0.5, 0.4, 0.6, 1, 0.7, -0.2, -0.3],
    [0.4, 0.3, 0.2, 0.5, 0.7, 1, -0.1, -0.4],
    [-0.3, -0.4, -0.3, -0.5, -0.2, -0.1, 1, 0.7],
    [-0.5, -0.6, -0.4, -0.6, -0.3, -0.4, 0.7, 1]
];
Plotly.newPlot('heatmap', [{
    x: xLabels,
    y: yLabels,
    z: zValues,
    type: 'heatmap',
    colorscale: 'Viridis',
    // Values wi;l go up to 2 decimal places
    text: zValues.map(row => row.map(val => val.toFixed(2))),
    texttemplate: '%{text}', 
    textfont: {
        size: 12,
        color: 'white' // Setting text color for better visibility
    },
    // Disabling the hover data so the chart has the values directly on the heatmap
    hoverinfo: 'none' 
}], {
    title: 'Correlation Heatmap of Player Metrics',
    xaxis: {
        title: 'Metrics',
        automargin: true
    },
    yaxis: {
        title: 'Metrics',
        automargin: true
    }
});
