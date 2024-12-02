// Load and process data
async function fetchData() {
    // Fetch the CSV file
    const response = await fetch('all_seasons_8.csv');
    const csvText = await response.text();

    // Parse the CSV into a usable format
    const data = Papa.parse(csvText, { header: true }).data;

    // Process data to calculate total stats for each team per season
    const teamSeasonStats = {};

    data.forEach(player => {
        const team = player.team_abbreviation;
        const season = player.season;

        // Ensure team and season exist in the data structure
        if (!teamSeasonStats[season]) teamSeasonStats[season] = {};
        if (!teamSeasonStats[season][team]) {
            teamSeasonStats[season][team] = { points: 0, assists: 0, rebounds: 0 };
        }

        // Calculate total points, assists, and rebounds
        const gamesPlayed = parseInt(player.gp) || 0;
        const points = parseFloat(player.pts) || 0;
        const assists = parseFloat(player.ast) || 0;
        const rebounds = parseFloat(player.reb) || 0;

        teamSeasonStats[season][team].points += points * gamesPlayed;
        teamSeasonStats[season][team].assists += assists * gamesPlayed;
        teamSeasonStats[season][team].rebounds += rebounds * gamesPlayed;
    });

    return teamSeasonStats;
}

// Populate dropdowns
function populateDropdowns(teamSeasonStats) {
    const seasons = Object.keys(teamSeasonStats);
    const teams = [...new Set(Object.values(teamSeasonStats).flatMap(season => Object.keys(season)))];

    // Populate season dropdown
    const seasonDropdown = document.getElementById('seasonDropdown');
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season;
        option.textContent = season;
        seasonDropdown.appendChild(option);
    });

    // Populate team dropdown
    const teamDropdown = document.getElementById('teamDropdown');
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamDropdown.appendChild(option);
    });
}

// Render the chart
function renderChart(teamSeasonStats, selectedSeason, selectedTeam) {
    const ctx = document.getElementById('teamChart').getContext('2d');

    // Extract data for the selected team and season
    const teamStats = teamSeasonStats[selectedSeason][selectedTeam];
    const data = {
        labels: ['Points', 'Assists', 'Rebounds'],
        datasets: [{
            label: `${selectedTeam} (${selectedSeason})`,
            data: [teamStats.points, teamStats.assists, teamStats.rebounds],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1
        }]
    };

    // Create or update the chart
    if (window.teamChart) {
        window.teamChart.data = data;
        window.teamChart.update();
    } else {
        window.teamChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// Initialize the app
async function init() {
    const teamSeasonStats = await fetchData();

    populateDropdowns(teamSeasonStats);

    // Event listeners for dropdown changes
    const seasonDropdown = document.getElementById('seasonDropdown');
    const teamDropdown = document.getElementById('teamDropdown');

    seasonDropdown.addEventListener('change', () => {
        const selectedSeason = seasonDropdown.value;
        const selectedTeam = teamDropdown.value;
        renderChart(teamSeasonStats, selectedSeason, selectedTeam);
    });

    teamDropdown.addEventListener('change', () => {
        const selectedSeason = seasonDropdown.value;
        const selectedTeam = teamDropdown.value;
        renderChart(teamSeasonStats, selectedSeason, selectedTeam);
    });

    // Initial render
    renderChart(teamSeasonStats, seasonDropdown.value, teamDropdown.value);
}

// Run the app
init();
