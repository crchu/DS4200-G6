const csvFilePath = "NBA_Players_2010.csv";

function initializeComparisonCharts() {
  fetch(csvFilePath)
    .then((response) => response.text())
    .then((csvData) => {
      const parsedData = Papa.parse(csvData, { header: true }).data;

      console.log("Parsed Data:", parsedData);

      const validData = parsedData.filter(
        (row) => row.team_abbreviation && row.player_name && row.pts
      );

      const teams = [...new Set(validData.map((row) => row.team_abbreviation))].sort();
      const compareSelect = document.getElementById("compareSelect");
      teams.forEach((team) => {
        if (team !== "BOS") {
          const option = document.createElement("option");
          option.value = team;
          option.textContent = team;
          compareSelect.appendChild(option);
        }
      });

      compareSelect.addEventListener("change", () => {
        const selectedTeam = compareSelect.value;
        if (selectedTeam) {
          renderComparisonCharts(selectedTeam, validData);
        }
      });

      function renderComparisonCharts(selectedTeam, data) {
        const metrics = [
          { field: "pts", title: "Points" },
          { field: "reb", title: "Rebounds" },
          { field: "ast", title: "Assists" },
        ];

        metrics.forEach((metric, index) => {
          const chartId = `chart-${index + 1}`;
          const chartSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": `${metric.title} Comparison: Celtics vs ${selectedTeam}`,
            "width": 300,
            "height": 400,
            "data": {
              "values": data,
            },
            "transform": [
              {
                "filter": {
                  "or": [
                    { "field": "team_abbreviation", "equal": "BOS" }, // Celtics
                    { "field": "team_abbreviation", "equal": selectedTeam }, // Selected team
                  ],
                },
              },
              {
                "aggregate": [
                  { "op": "mean", "field": metric.field, "as": "average_value" },
                ],
                "groupby": ["team_abbreviation"],
              },
            ],
            "mark": "bar",
            "encoding": {
              "x": {
                "field": "team_abbreviation",
                "type": "nominal",
                "title": "Team",
              },
              "y": {
                "field": "average_value",
                "type": "quantitative",
                "title": `Average ${metric.title}`,
              },
              "color": {
                "field": "team_abbreviation",
                "type": "nominal",
                "title": "Team",
              },
              "tooltip": [
                { "field": "team_abbreviation", "type": "nominal", "title": "Team" },
                { "field": "average_value", "type": "quantitative", "title": `Average ${metric.title}` },
              ],
            },
          };

          // Render the chart in its respective div
          vegaEmbed(`#${chartId}`, chartSpec).catch(console.error);
        });
      }
    })
    .catch((error) => console.error("Error loading or parsing CSV:", error));
}

initializeComparisonCharts();
