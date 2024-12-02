const csvFilePath = "NBA_Players_2010.csv";

function initializeComparisonCharts() {
  fetch(csvFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch CSV: " + response.statusText);
      }
      return response.text();
    })
    .then((csvData) => {
      const parsedData = Papa.parse(csvData, { header: true }).data;

      // Validate and process data
      const processedData = parsedData
        .filter((row) => row.team_abbreviation && row.season)
        .map((row) => ({
          team_abbreviation: row.team_abbreviation,
          season: row.season,
          pts: parseFloat(row.pts || 0),
          gp: parseInt(row.gp || 0),
          reb: parseFloat(row.reb || 0),
          ast: parseFloat(row.ast || 0),
          total_points: parseFloat(row.pts || 0) * parseInt(row.gp || 0),
          total_rebounds: parseFloat(row.reb || 0) * parseInt(row.gp || 0),
          total_assists: parseFloat(row.ast || 0) * parseInt(row.gp || 0),
        }));

      console.log("Processed Data:", processedData);

      // Extract unique teams and seasons
      const teams = [...new Set(processedData.map((row) => row.team_abbreviation))].sort();
      const seasons = [...new Set(processedData.map((row) => row.season))].sort();

      console.log("Teams:", teams);
      console.log("Seasons:", seasons);

      // Populate the dropdowns
      const teamSelect = document.getElementById("teamSelect");
      const seasonSelect = document.getElementById("seasonSelect");

      teams.forEach((team) => {
        const option = document.createElement("option");
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
      });

      seasons.forEach((season) => {
        const option = document.createElement("option");
        option.value = season;
        option.textContent = season;
        seasonSelect.appendChild(option);
      });

      // Event listeners for dropdown changes
      teamSelect.addEventListener("change", () => updateCharts(teamSelect, seasonSelect, processedData));
      seasonSelect.addEventListener("change", () => updateCharts(teamSelect, seasonSelect, processedData));
    })
    .catch((error) => console.error("Error loading or processing data:", error));
}

function updateCharts(teamSelect, seasonSelect, data) {
  const selectedTeam = teamSelect.value;
  const selectedSeason = seasonSelect.value;

  if (!selectedTeam || !selectedSeason) {
    console.warn("Both team and season must be selected.");
    return;
  }

  console.log(`Selected Team: ${selectedTeam}, Selected Season: ${selectedSeason}`);

  const filteredData = data.filter(
    (row) => row.team_abbreviation === selectedTeam && row.season === selectedSeason
  );

  console.log("Filtered Data:", filteredData);

  const totalPoints = filteredData.reduce((sum, row) => sum + row.total_points, 0);
  const totalRebounds = filteredData.reduce((sum, row) => sum + row.total_rebounds, 0);
  const totalAssists = filteredData.reduce((sum, row) => sum + row.total_assists, 0);

  const metrics = [
    { id: "chart-1", title: "Total Points", value: totalPoints },
    { id: "chart-2", title: "Total Rebounds", value: totalRebounds },
    { id: "chart-3", title: "Total Assists", value: totalAssists },
  ];

  metrics.forEach((metric) => {
    const chartSpec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "title": `${metric.title} (${selectedSeason}) for ${selectedTeam}`,
      "width": 300,
      "height": 400,
      "data": {
        "values": [{ Team: selectedTeam, Value: metric.value }],
      },
      "mark": "bar",
      "encoding": {
        "x": { "field": "Team", "type": "nominal", "title": "Team" },
        "y": { "field": "Value", "type": "quantitative", "title": metric.title },
        "color": { "field": "Team", "type": "nominal", "title": "Team" },
        "tooltip": [
          { "field": "Team", "type": "nominal", "title": "Team" },
          { "field": "Value", "type": "quantitative", "title": metric.title },
        ],
      },
    };

    vegaEmbed(`#${metric.id}`, chartSpec).catch(console.error);
  });
}

// Initialize the charts
initializeComparisonCharts();
