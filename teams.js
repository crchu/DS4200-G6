<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team and Player Comparison</title>
  <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.3.1/papaparse.min.js"></script>
</head>
<body>

  <h3>Average Metric Comparison for Selected Teams</h3>

  <div id="controls">
    <label for="compareSelect">Select a Team to Compare Against Celtics:</label>
    <select id="compareSelect">
      <option value="">-- Select a Team --</option>
    </select>
  </div>

  <div id="metricControls">
    <label for="metricSelect">Select a Metric:</label>
    <select id="metricSelect">
      <option value="pts">Points</option>
      <option value="reb">Rebounds</option>
      <option value="ast">Assists</option>
    </select>
  </div>

  <div id="barChart"></div>

  <script>
    const csvFilePath = "NBA_Players_2010.csv";

    fetch(csvFilePath)
      .then(response => response.text())
      .then(csvData => {
        const parsedData = Papa.parse(csvData, { header: true }).data;

        console.log("Parsed Data:", parsedData);

        const validData = parsedData.filter(row => row.team_abbreviation && row.player_name && row.pts);

        // Populate team dropdown
        const teams = [...new Set(validData.map(row => row.team_abbreviation))].sort();
        const compareSelect = document.getElementById("compareSelect");
        teams.forEach(team => {
          if (team !== "BOS") { 
            const option = document.createElement("option");
            option.value = team;
            option.textContent = team;
            compareSelect.appendChild(option);
          }
        });

        const metricSelect = document.getElementById("metricSelect");
          
        compareSelect.addEventListener("change", () => {
          const selectedTeam = compareSelect.value;
          const selectedMetric = metricSelect.value;
          if (selectedTeam) {
            renderComparisonChart(selectedTeam, validData, selectedMetric);
          }
        });

        metricSelect.addEventListener("change", () => {
          const selectedTeam = compareSelect.value;
          const selectedMetric = metricSelect.value;
          if (selectedTeam) {
            renderComparisonChart(selectedTeam, validData, selectedMetric);
          }
        });

        function renderComparisonChart(selectedTeam, data, metric = "pts") {
          const barChartSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": `${metric.toUpperCase()} Comparison: Celtics vs ${selectedTeam}`,
            "width": 600,
            "height": 400,
            "data": {
              "values": data
            },
            "transform": [
              {
                "filter": {
                  "or": [
                    { "field": "team_abbreviation", "equal": "BOS" }, // Celtics
                    { "field": "team_abbreviation", "equal": selectedTeam } // Selected team
                  ]
                }
              },
              {
                "aggregate": [
                  { "op": "mean", "field": metric, "as": "average_value" }
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
                "field": "average_value",
                "type": "quantitative",
                "title": `Average ${metric}`
              },
              "color": {
                "field": "team_abbreviation",
                "type": "nominal",
                "title": "Team"
              },
              "tooltip": [
                { "field": "team_abbreviation", "type": "nominal", "title": "Team" },
                { "field": "average_value", "type": "quantitative", "title": `Average ${metric}` }
              ]
            }
          };

          vegaEmbed("#barChart", barChartSpec).catch(console.error);
        }
      })
      .catch(error => console.error("Error loading or parsing CSV:", error));
  </script>
</body>
</html>
