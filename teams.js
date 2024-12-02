const margin = { top: 40, right: 30, bottom: 60, left: 50 },
      width = 300 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

const attributes = ['pts', 'reb', 'ast', 'gp'];
const titles = ["Total Points Scored", "Total Rebounds", "Total Assists", "Games Played"];
const yLabels = ["Total Points", "Total Rebounds", "Total Assists", "Games Played"];

d3.csv("NBA_Players_2010.csv").then(data => {
  // Preprocess the data
  data.forEach(d => {
    d.pts = +d.pts * d.gp; // Total points
    d.reb = +d.reb * d.gp; // Total rebounds
    d.ast = +d.ast * d.gp; // Total assists
    d.gp = +d.gp; // Games played
  });

  // Extract unique teams and seasons
  const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();
  const seasons = Array.from(new Set(data.map(d => d.season))).sort();

  // Populate the dropdowns
  const teamSelect = d3.select("#teamSelect");
  const seasonSelect = d3.select("#seasonSelect");

  teams.forEach(team => {
    teamSelect.append("option").text(team).attr("value", team);
  });

  seasons.forEach(season => {
    seasonSelect.append("option").text(season).attr("value", season);
  });

  // Update the charts when a team and season are selected
  function updateCharts(selectedTeam, selectedSeason) {
    const filteredData = data.filter(d => d.team_abbreviation === selectedTeam && d.season === selectedSeason);

    // Remove old charts
    d3.select("#charts").selectAll("*").remove();

    if (filteredData.length === 0) {
      d3.select("#charts").append("p").text("No data available for the selected team and season.");
      return;
    }

    attributes.forEach((attr, i) => {
      const chartDiv = d3.select("#charts").append("div").attr("class", "chart");

      // Add chart title above the chart
      chartDiv.append("h3")
        .attr("class", "chart-title")
        .style("text-align", "center")
        .style("margin-bottom", "10px")
        .style("font-size", "16px")
        .text(titles[i]);

      const svg = chartDiv.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define scales
      const x = d3.scaleBand()
        .domain([selectedSeason])
        .range([0, width])
        .padding(0.5);

      const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d[attr])]).nice()
        .range([height, 0]);

      // Add x-axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
        .selectAll("text")
        .style("font-size", "12px");

      // Add y-axis
      svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width))
        .selectAll("line")
        .style("stroke", "#e0e0e0");

      // Add bars
      svg.selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.season))
        .attr("y", d => y(d[attr]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[attr]))
        .attr("fill", "steelblue");

      // Add y-axis label
      svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(yLabels[i]);
    });
  }

  // Initial load
  const initialTeam = teams[0];
  const initialSeason = seasons[0];
  updateCharts(initialTeam, initialSeason);

  teamSelect.on("change", function() {
    updateCharts(this.value, seasonSelect.property("value"));
  });

  seasonSelect.on("change", function() {
    updateCharts(teamSelect.property("value"), this.value);
  });
});
