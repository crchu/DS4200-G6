const csvFilePath = "NBA_Players_2010.csv";


function initializeComparisonCharts() {
  fetch(csvFilePath)
    .then((response) => response.text())
    .then((csvData) => {
      const parsedData = Papa.parse(csvData, { header: true }).data;

      console.log("Parsed Data:", parsedData);

 
      const processedData = parsedData.map((row) => ({
        ...row,
        total_points: row.pts * row.gp || 0,
        total_rebounds: row.reb * row.gp || 0,
        total_assists: row.ast * row.gp || 0,
      }));

    
      const teams = [...new Set(processedData.map((row) => row.team_abbreviation))].sort();
      const seasons = [...new Set(processedData.map((row) => row.season))].sort();


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


      teamSelect.addEventListener("change", () => {
        const selectedTeam = teamSelect.value;
        const selectedSeason = seasonSelect.value;
        if (selectedTeam && selectedSeason) {
          renderComparisonCharts(selectedTeam, selectedSeason, processedData);
        }
      });

      seasonSelect.addEventListener("change", () => {
        const selectedTeam = teamSelect.value;
        const selectedSeason = seasonSelect.value;
        if (selectedTeam && selectedSeason) {
          renderComparisonCharts(selectedTeam, selectedSeason, processedData);
        }
      });

     
      function renderComparisonCharts(selectedTeam, selectedSeason, data) {
        // Filter data for the selected team and season
        const teamSeasonData = data.filter(
          (row) => row.team_abbreviation === selectedTeam && row.season === selectedSeason
        );

        
        const totalPoints = teamSeasonData.reduce((sum, row) => sum + (row.total_points || 0), 0);
        const totalRebounds = teamSeasonData.reduce((sum, row) => sum + (row.total_rebounds || 0), 0);
        const totalAssists = teamSeasonData.reduce((sum, row) => sum + (row.total_assists || 0), 0);

        
        const metrics = [
          { title: "Total Points", value: totalPoints, id: "chart-1" },
          { title: "Total Rebounds", value: totalRebounds, id: "chart-2" },
          { title: "Total Assists", value: totalAssists, id: "chart-3" },
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
    })
    .catch((error) => console.error("Error loading or parsing CSV:", error));
}

initializeComparisonCharts();
