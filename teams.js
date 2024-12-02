const csvFilePath = "NBA_Players_2010.csv";

d3.csv(csvFilePath).then(data => {
  // Step 1: Preprocess the data
  const processedData = data.map(d => ({
    season: d.season,
    team_abbreviation: d.team_abbreviation.trim(), // Ensure no extra spaces
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

  // Step 3: Generate the improved Vega-Lite spec
  const vegaLiteSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: {
      text: "Team Performance Metrics Across Seasons",
      subtitle: "Comparing Points, Rebounds, and Assists for All Teams",
      fontSize: 16
    },
    width: 800,
    height: 500,
    data: {
      values: aggregatedData
    },
    transform: [
      { fold: ["pts", "reb", "ast"], as: ["metric", "value"] }
    ],
    mark: "line",
    encoding: {
      x: {
        field: "season",
        type: "ordinal",
        title: "Season",
        sort: "ascending",
        axis: { labelAngle: 0 }
      },
      y: {
        field: "value",
        type: "quantitative",
        title: "Average Metric Value"
      },
      color: {
        field: "metric",
        type: "nominal",
        title: "Metric",
        scale: { scheme: "category10" }
      },
      strokeDash: {
        field: "team_abbreviation",
        type: "nominal",
        title: "Team"
      },
      tooltip: [
        { field: "season", type: "ordinal", title: "Season" },
        { field: "team_abbreviation", type: "nominal", title: "Team" },
        { field: "metric", type: "nominal", title: "Metric" },
        { field: "value", type: "quantitative", title: "Average Value" }
      ]
    },
    config: {
      line: { point: true },
      axis: { labelFontSize: 12, titleFontSize: 14 },
      legend: { titleFontSize: 14, labelFontSize: 12 }
    }
  };

  // Step 4: Render the chart
  vegaEmbed("#chart", vegaLiteSpec).catch(console.error);
});
