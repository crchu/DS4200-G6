const csvFilePath = "NBA_Players_2010.csv";

// Function to fetch data, populate dropdowns, and render the chart
function initializeComparisonChart() {
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

      // Metric dropdown
      const metricSelect = document.getElementById("metricSelect");

      // Listen for team or metric selection changes
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
                  { "field": "team_abbreviation", "equal": "BOS" }, 
                  { "field": "team_abbreviation", "equal": selectedTeam }
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
}
initializeComparisonChart();
