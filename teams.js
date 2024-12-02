const csvFilePath = "NBA_Players_2010.csv";

d3.csv(csvFilePath).then(data => {
  // Step 1: Preprocess the data
  const processedData = data.map(d => ({
    season: d.season.trim(),
    team_abbreviation: d.team_abbreviation.trim(),
    gp: +d.gp, // Games played
    pts: +d.pts, // Average points
    reb: +d.reb, // Average rebounds
    ast: +d.ast // Average assists
  }));

  // Step 2: Calculate total metrics for each player (points, rebounds, assists)
  const playerTotals = processedData.map(d => ({
    season: d.season,
    team_abbreviation: d.team_abbreviation,
    total_points: d.pts * d.gp, // Total points scored by the player
    total_rebounds: d.reb * d.gp, // Total rebounds
    total_assists: d.ast * d.gp // Total assists
  }));

  // Step 3: Aggregate totals at the team level by season
  const teamTotals = Array.from(
    d3.group(playerTotals, d => `${d.season}-${d.team_abbreviation}`),
    ([key, values]) => {
      const [season, team_abbreviation] = key.split("-");
      return {
        season,
        team_abbreviation,
        total_points: d3.sum(values, v => v.total_points),
        total_rebounds: d3.sum(values, v => v.total_rebounds),
        total_assists: d3.sum(values, v => v.total_assists)
      };
    }
  );

  // Debug: Log aggregated data for verification
  console.log("Team Totals:", teamTotals);

  // Step 4: Generate Vega-Lite spec
  const vegaLiteSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: {
      text: "NBA Team Total Performance Metrics by Season",
      subtitle: "Total Points, Rebounds, and Assists per Team and Season",
      fontSize: 16
    },
    width: 900,
    height: 500,
    data: {
      values: teamTotals
    },
    transform: [
      { fold: ["total_points", "total_rebounds", "total_assists"], as: ["metric", "value"] }
    ],
    mark: "bar",
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
        title: "Total Value"
      },
      color: {
        field: "metric",
        type: "nominal",
        title: "Metric",
        scale: { scheme: "category10" }
      },
      column: {
        field: "team_abbreviation",
        type: "nominal",
        title: "Team",
        spacing: 10
      },
      tooltip: [
        { field: "season", type: "ordinal", title: "Season" },
        { field: "team_abbreviation", type: "nominal", title: "Team" },
        { field: "metric", type: "nominal", title: "Metric" },
        { field: "value", type: "quantitative", title: "Total Value", format: ".2f" }
      ]
    },
    config: {
      axis: { labelFontSize: 12, titleFontSize: 14 },
      legend: { titleFontSize: 14, labelFontSize: 12 }
    }
  };

  // Step 5: Render the chart
  vegaEmbed("#chart", vegaLiteSpec).catch(console.error);
});
