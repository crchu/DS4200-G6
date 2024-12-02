<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team and Player Selection</title>
  <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.3.1/papaparse.min.js"></script>
</head>
<body>

  <script>
    const csvFilePath = "NBA_Players_2010"; 

    fetch(csvFilePath)
      .then(response => response.text())
      .then(csvData => {
        const parsedData = Papa.parse(csvData, { header: true }).data;

        console.log("Parsed Data:", parsedData);

        const validData = parsedData.filter(row => row.team_abbreviation && row.player_name);

        const teams = [...new Set(validData.map(row => row.team_abbreviation))].sort();
        const teamSelect = document.getElementById("teamSelect");
        teams.forEach(team => {
          const option = document.createElement("option");
          option.value = team;
          option.textContent = team;
          teamSelect.appendChild(option);
        });

        const playerSelect = document.getElementById("playerSelect");
        teamSelect.addEventListener("change", () => {
          const selectedTeam = teamSelect.value;
          const players = validData
            .filter(row => row.team_abbreviation === selectedTeam)
            .map(row => row.player_name)
            .sort();

          playerSelect.innerHTML = '<option value="">-- Select a Player --</option>';
          players.forEach(player => {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
          });
        });

        const barChartSpec = {
          "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
          "title": "Points Comparison (Selected Team vs Celtics)",
          "width": 600,
          "height": 400,
          "data": {
            "values": validData
          },
          "transform": [
            {
              "filter": {
                "or": [
                  {"field": "team_abbreviation", "equal": "BOS"}, 
                  {"field": "team_abbreviation", "oneOf": teams} 
                ]
              }
            },
            {
              "aggregate": [
                {"op": "mean", "field": "pts", "as": "average_points"}
              ],
              "groupby": ["team_abbreviation"]
            }
          ],
          "mark": "bar",
          "encoding": {
            "x": {
              "field": "team_abbreviation",
              "type": "nominal",
              "title": "Team"
            },
            "y": {
              "field": "average_points",
              "type": "quantitative",
              "title": "Average Points"
            },
            "color": {
              "field": "team_abbreviation",
              "type": "nominal",
              "title": "Team"
            },
            "tooltip": [
              {"field": "team_abbreviation", "type": "nominal", "title": "Team"},
              {"field": "average_points", "type": "quantitative", "title": "Average Points"}
            ]
          }
        };

        // Render the bar chart
        vegaEmbed("#barChart", barChartSpec).catch(console.error);
      })
      .catch(error => console.error("Error loading or parsing CSV:", error));
  </script>
</body>
</html>
