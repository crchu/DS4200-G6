const csvFilePath = "NBA_Players_2010.csv";

d3.csv(csvFilePath).then(data => {
  // Step 1: Preprocess the data
  const processedData = data.map(d => ({
    season: d.season,
    team_abbreviation: d.team_abbreviation,
    pts: +d.pts,
    reb: +d.reb,
    ast: +d.ast
  }));

  // Step 2: Aggregate data by team and season
  const aggregatedData = Array.from(
    d3.group(processedData, d => `${d.season}-${d.team_abbreviation}`),
    ([key, values]) => {
      const [season, team_abbreviation] = key.split("-");
      return {
        season,
        team_abbreviation,
        pts: d3.mean(values, d => d.pts),
        reb: d3.mean(values, d => d.reb),
        ast: d3.mean(values, d => d.ast)
      };
    }
  );

  // Step 3: Generate the Vega-Lite spec
  const vegaLiteSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Team Performance Metrics Across Seasons",
    width: 800,
    height: 400,
    data: {
      values: aggregatedData
    },
    transform: [
      { fold: ["pts", "reb", "ast"], as: ["metric", "value"] }
    ],
    mark: "line",
    encoding: {
      x: { field: "season", type: "ordinal", title: "Season" },
      y: { field: "value", type: "quantitative", title: "Average Metric Value" },
      color: { field: "metric", type: "nominal", title: "Metric" },
      tooltip: [
        { field: "season", type: "ordinal", title: "Season" },
        { field: "team_abbreviation", type: "nominal", title: "Team" },
        { field: "metric", type: "nominal", title: "Metric" },
        { field: "value", type: "quantitative", title: "Average" }
      ]
    },
    selection: {
      team: {
        type: "single",
        fields: ["team_abbreviation"],
        bind: { input: "select", options: Array.from(new Set(aggregatedData.map(d => d.team_abbreviation))), name: "Select Team: " }
      }
    }
  };

  // Step 4: Render the chart
  vegaEmbed("#chart", vegaLiteSpec).catch(console.error);
});
