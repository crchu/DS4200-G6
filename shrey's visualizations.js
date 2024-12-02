// Correlation Heatmap
Plotly.newPlot('heatmap', [{
    x: ['Age', 'Height', 'Weight', 'Points', 'Rebounds', 'Assists', 'Draft Year', 'Draft Round'],
    y: ['Age', 'Height', 'Weight', 'Points', 'Rebounds', 'Assists', 'Draft Year', 'Draft Round'],
    z: [
        [1, 0.7, 0.5, 0.8, 0.6, 0.4, -0.3, -0.5],
        [0.7, 1, 0.8, 0.6, 0.5, 0.3, -0.4, -0.6],
        [0.5, 0.8, 1, 0.7, 0.4, 0.2, -0.3, -0.4],
        [0.8, 0.6, 0.7, 1, 0.6, 0.5, -0.5, -0.6],
        [0.6, 0.5, 0.4, 0.6, 1, 0.7, -0.2, -0.3],
        [0.4, 0.3, 0.2, 0.5, 0.7, 1, -0.1, -0.4],
        [-0.3, -0.4, -0.3, -0.5, -0.2, -0.1, 1, 0.7],
        [-0.5, -0.6, -0.4, -0.6, -0.3, -0.4, 0.7, 1]
    ],
    type: 'heatmap',
    colorscale: 'Viridis'
}], {
    title: 'Correlation Heatmap of Player Metrics',
    xaxis: { title: 'Metrics' },
    yaxis: { title: 'Metrics' }
});

// Shooting Efficiency
Plotly.newPlot('shootingEfficiency', [{
    x: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4],
    y: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.5, 0.55, 0.6, 0.4, 0.45, 0.5, 0.35, 0.4, 0.45],
    type: 'box'
}], {
    title: 'Shooting Efficiency by Draft Round',
    xaxis: {
        title: 'Draft Round',
        tickvals: [0, 1, 2, 3, 4], // Numeric values for positions
        ticktext: ['Undrafted', '1', '2', '3', '4'] // Custom labels
    },
    yaxis: { title: 'Shooting Percentage' }
});
