const csvFilePath = "NBA_Players_2010.csv";

d3.csv(csvFilePath).then(data => {
  // Debugging: Log raw data
  console.log("Loaded Data:", data);

  // Extract unique teams and seasons
  const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).filter(Boolean).sort();
  const seasons = Array.from(new Set(data.map(d => d.season))).filter(Boolean).sort();

  // Debugging: Log extracted values
  console.log("Teams:", teams);
  console.log("Seasons:", seasons);

  const teamSelect = d3.select("#teamSelect");
  const seasonSelect = d3.select("#seasonSelect");

  // Populate the team dropdown
  teams.forEach(team => {
    if (team) {
      console.log("Adding team option:", team); // Log every team added
      teamSelect.append("option").text(team).attr("value", team);
    }
  });

  // Populate the season dropdown
  seasons.forEach(season => {
    if (season) {
      console.log("Adding season option:", season); // Log every season added
      seasonSelect.append("option").text(season).attr("value", season);
    }
  });

  // Handle dropdown change
  teamSelect.on("change", function () {
    const selectedTeam = this.value;
    const selectedSeason = seasonSelect.property("value");
    if (selectedTeam && selectedSeason) {
      updateCharts(selectedTeam, selectedSeason, data);
    }
  });

  seasonSelect.on("change", function () {
    const selectedSeason = this.value;
    const selectedTeam = teamSelect.property("value");
    if (selectedTeam && selectedSeason) {
      updateCharts(selectedTeam, selectedSeason, data);
    }
  });

  // Initialize with the first team and season
  if (teams.length > 0 && seasons.length > 0) {
    teamSelect.property("value", teams[0]);
    seasonSelect.property("value", seasons[0]);
    updateCharts(teams[0], seasons[0], data);
  } else {
    console.error("No valid teams or seasons found.");
  }
}).catch(error => {
  console.error("Error loading CSV file:", error);
});

// Update charts function
function updateCharts(team, season, data) {
  const filteredData = data.filter(d => d.team_abbreviation === team && d.season === season);

  if (filteredData.length === 0) {
    d3.select("#charts").text("No data available for the selected team and season.");
    return;
  }

  d3.select("#charts").selectAll("*").remove(); // Clear existing charts

  // Metric 1: Total Points
  const totalPoints = filteredData.reduce((sum, d) => sum + (+d.pts || 0), 0);

  // Metric 2: Total Rebounds
  const totalRebounds = filteredData.reduce((sum, d) => sum + (+d.reb || 0), 0);

  // Metric 3: Total Assists
  const totalAssists = filteredData.reduce((sum, d) => sum + (+d.ast || 0), 0);

  // Bar Chart for Total Points, Rebounds, and Assists
  const metrics = [
    { label: "Total Points", value: totalPoints },
    { label: "Total Rebounds", value: totalRebounds },
    { label: "Total Assists", value: totalAssists }
  ];

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select("#charts")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(metrics.map(d => d.label))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(metrics, d => d.value)]).nice()
    .range([height, 0]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll(".bar")
    .data(metrics)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", "steelblue");

  // Add labels to bars
  svg.selectAll(".label")
    .data(metrics)
    .enter()
    .append("text")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", "12px")
    .text(d => d.value);
}
