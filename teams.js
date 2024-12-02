<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Stats Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <canvas id="playerChart" width="800" height="400"></canvas>
    <script>
        // Sample data (replace with your CSV processing logic)
        const data = [
            { height: 193.04, weight: 94.8, points: 3.9 },
            { height: 190.5, weight: 86.18, points: 3.8 },
            { height: 203.2, weight: 103.42, points: 8.3 },
            { height: 203.2, weight: 102.06, points: 10.2 },
            { height: 213.36, weight: 119.75, points: 2.8 }
        ];

        // Transform data for the scatter plot
        const chartData = data.map(player => ({
            x: player.height,
            y: player.weight,
            r: player.points // Use points to determine bubble size
        }));

        // Create the chart
        const ctx = document.getElementById('playerChart').getContext('2d');
        new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Player Stats',
                    data: chartData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Player Height (cm)' },
                        beginAtZero: false
                    },
                    y: {
                        title: { display: true, text: 'Player Weight (kg)' },
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const data = context.raw;
                                return `Height: ${data.x}, Weight: ${data.y}, Points: ${data.r}`;
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
