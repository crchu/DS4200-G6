const margin = { top: 40, right: 30, bottom: 60, left: 50 },
  width = 300 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

// Load the data
d3.csv("NBA_Players_2010.csv").then((data) => {
  // Process the data
  data.forEach((d) => {
    d.pts = +d.pts;
    d.reb = +d.reb;
    d.ast = +d.ast;
    d.gp = +d.gp;
    d.total_points = d.pts * d.gp;
    d.total_rebounds = d.reb * d.gp;
    d.total_assists = d.ast * d.gp;
  });

  // Group data by team and season
  const teamSeasonData = d3.group(data, (d) => d.team_abbreviation, (d) => d.season);

  // Extract unique teams and seasons
  const teams = Array.from(teamSeasonData.keys()).sort();
  const seasons = Array.from(new Set(data.map((d) => d.season))).sort();

  // Populate dropdowns
  const teamSelect = d3.select("#teamSelect");
  const seasonSelect = d3.select("#seasonSelect");

  teams.forEach((team) => {
    teamSelect.append("option").text(team).attr("value", team);
  });

  seasons.forEach((season) => {
    seasonSelect.append("option").text(season).attr("value", season);
  });

  // Function to update charts
  function updateCharts(team, season) {
    const seasonData = teamSeasonData.get(team)?.get(season) || [];
    const totalPoints = d3.sum(seasonData, (d) => d.total_points);
    const totalRebounds = d3.sum(seasonData, (d) => d.total_rebounds);
    const totalAssists = d3.sum(seasonData, (d) => d.total_assists);

    const metrics = [
      { title: "Total Points", value: totalPoints },
      { title: "Total Rebounds", value: totalRebounds },
      { title: "Total Assists", value: totalAssists },
    ];

    // Clear existing charts
    d3.select("#charts").selectAll("*").remove();

    // Generate charts
    metrics.forEach((metric) => {
      const svg = d3
        .select("#charts")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define scales
      const x = d3.scaleBand().domain([metric.title]).range([0, width]).padding(0.5);
