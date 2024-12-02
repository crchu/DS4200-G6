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

  // Step 4: Generate the radar chart spec
  const vegaLiteSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: {
      text: "NBA Team Performance Metrics Radar",
      subtitle: "Compare Total Points, Assists, and Rebounds Across Teams",
      fontSize: 16
    },
    width: 500,
    height: 500,
    data: {
      values: teamTotals
    },
    transform: [
      { filter: "datum.season == '2022'" }, // Default to the 2022 season
      { fold: ["total_points", "total_rebounds", "total_assists"], as: ["metric", "value"] }
    ],
    mark: {
      type: "line",
      point: true
    },
    encoding: {
      theta: {
        field: "metric",
        type: "nominal",
        title: "Metric",
        sort: ["total_points", "total_rebounds", "total_assists"]
      },
      radius: {
        field: "value",
        type: "quantitative",
        title: "Total Value",
        scale: { zero: true }
      },
      color: {
        field: "team_abbreviation",
        type: "nominal",
        title: "Team",
        legend: { orient: "top" }
      },
      tooltip: [
        { field: "season", type: "ordinal", title: "Season" },
        { field: "team_abbreviation", type: "nominal", title: "Team" },
        { field: "metric", type: "nominal", title: "Metric" },
        { field: "value", type: "quantitative", title: "Total Value", format: ".2f" }
      ]
    },
    config: {
      view: { stroke: null },
      axis: { labelFontSize: 12, titleFontSize: 14 },
      legend: { titleFontSize: 14, labelFontSize: 12 }
    }
  };

  // Render the radar chart
  vegaEmbed("#chart", vegaLiteSpec).catch(console.error);

  // Add interactivity: Dropdown for selecting seasons
  const seasons = Array.from(new Set(teamTotals.map(d => d.season))).sort();
  const dropdown = d3.select("body").append("select").attr("id", "seasonDropdown");

  dropdown
    .selectAll("option")
    .data(seasons)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  dropdown.on("change", function () {
    const selectedSeason = this.value;

    // Update the chart with the selected season
    const updatedSpec = {
      ...vegaLiteSpec,
      transform: [
        { filter: `datum.season == '${selectedSeason}'` },
        { fold: ["total_points", "total_rebounds", "total_assists"], as: ["metric", "value"] }
      ]
    };

    vegaEmbed("#chart", updatedSpec).catch(console.error);
  });
});
