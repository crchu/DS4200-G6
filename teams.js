const csvFilePath = "NBA_Players_2010.csv";

const margin = { top: 40, right: 30, bottom: 60, left: 50 },
      width = 300 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

d3.csv(csvFilePath).then(data => {
  // Preprocess data
  data.forEach(d => {
    d.pts = +d.pts;
    d.reb = +d.reb;
    d.ast = +d.ast;
    d.gp = +d.gp;
  });

  // Get unique teams and seasons
  const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();
  const seasons = Array.from(new Set(data.map(d => d.season))).sort();

  const teamSelect = d3.select("#teamSelect");
  const seasonSelect = d3.select("#seasonSelect");

  // Populate the team dropdown
  teams.forEach(team => {
    teamSelect.append("option").text(team).attr("value", team);
  });

  // Populate the season dropdown
  seasons.forEach(season => {
    seasonSelect.append("option").text(season).attr("value", season);
  });

  // Update the charts when a team and season are selected
  function updateCharts(selectedTeam, selectedSeason) {
    const filteredData = data.filter(d => d.team_abbreviation === selectedTeam && d.season === selectedSeason);

    if (filteredData.length === 0) {
      console.warn("No data available for the selected team and season.");
      return;
    }

    d3.select("#charts").selectAll("*").remove(); // Clear existing charts

    // Example metric: Total Points
    const totalPoints = filteredData.reduce((sum, d) => sum + d.pts, 0);

    const svg = d3.select("#charts")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.player_name))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.pts)]).nice()
      .range([height, 0]);

    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "10px");

    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width))
      .selectAll("line")
      .style("stroke", "#e0e0e0");

    // Add bars
    svg.selectAll("rect")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.player_name))
      .attr("y", d => y(d.pts))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.pts))
      .attr("fill", "steelblue");

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Players");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Points");
  }

  // Handle dropdown change
  teamSelect.on("change", function () {
    const selectedTeam = this.value;
    const selectedSeason = seasonSelect.property("value");
    if (selectedTeam && selectedSeason) {
      updateCharts(selectedTeam, selectedSeason);
    }
  });

  seasonSelect.on("change", function () {
    const selectedSeason = this.value;
    const selectedTeam = teamSelect.property("value");
    if (selectedTeam && selectedSeason) {
      updateCharts(selectedTeam, selectedSeason);
    }
  });

  // Initialize charts with the first team and season
  const initialTeam = teams[0];
  const initialSeason = seasons[0];
  teamSelect.property("value", initialTeam);
  seasonSelect.property("value", initialSeason);
  updateCharts(initialTeam, initialSeason);
});
