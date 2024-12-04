const margin = { top: 40, right: 30, bottom: 60, left: 50 }; 
const width = 300 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const attributes = ['pts', 'reb', 'ast', 'gp'];
const titles = ["Average Points per Game", "Average Rebounds per Game", "Average Assists per Game", "Games Played"];
const yLabels = ["Average Points per Game", "Average Rebounds per Game", "Average Assists per Game", "Games Played"];
const colors = ["steelblue", "orange", "green", "purple"]; 

d3.csv("NBA_Players.csv").then(data => {
  data.forEach(d => {
    d.pts = +d.pts;
    d.reb = +d.reb;
    d.ast = +d.ast;
    d.gp = +d.gp;
  });

  const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();
  const teamSelection = d3.select("#teamSelection"); 
  const playerSelection = d3.select("#playerSelection"); 

  // Populate the team dropdown
  teams.forEach(team => {
    teamSelection.append("option").text(team).attr("value", team);
  });

  // Update player dropdown when a team is selected
  function updatePlayerDropdown(selectedTeam) {
    const players = Array.from(new Set(data.filter(d => d.team_abbreviation === selectedTeam).map(d => d.player_name))).sort();
    playerSelection.selectAll("option").remove();
    players.forEach(player => {
      playerSelection.append("option").text(player).attr("value", player);
    });
    if (players.length > 0) {
      updateCharts(players[0]); 
    } else {
      d3.select("#charts").selectAll("*").remove(); // Clear charts if no players
    }
  }

  // Update the charts when a player is selected
  function updateCharts(playerName) {
    const playerData = data.filter(d => d.player_name === playerName);
    d3.select("#charts").selectAll("*").remove(); 

    attributes.forEach((attr, i) => {
      const chartDiv = d3.select("#charts").append("div").attr("class", "chart");

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

      const x = d3.scalePoint()
        .domain(playerData.map(d => d.season))
        .range([0, width])
        .padding(0.5);

      const y = d3.scaleLinear()
        .domain([0, d3.max(playerData, d => d[attr])]).nice()
        .range([height, 0]);

      svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(
            d3.axisBottom(x)
              .tickValues(x.domain().filter((_, i) => i % 2 === 0)) 
              .tickSize(0)
              .tickPadding(10)
          )
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("transform", "rotate(-45)")
          .style("font-size", "10px");

      svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width))
        .selectAll("line")
        .style("stroke", "#e0e0e0");

      const line = d3.line()
        .x(d => x(d.season))
        .y(d => y(d[attr]));

      svg.append("path")
        .datum(playerData)
        .attr("fill", "none")
        .attr("stroke", colors[i % colors.length])
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Tooltip setup
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
        .style("visibility", "hidden")
        .style("font-size", "12px");

      svg.selectAll("circle")
        .data(playerData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.season))
        .attr("cy", d => y(d[attr]))
        .attr("r", 4)
        .attr("fill", colors[i % colors.length])
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`
              <strong>Season:</strong> ${d.season}<br>
              <strong>${titles[i]}:</strong> ${d[attr]}
            `)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

      svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Season");

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

  updatePlayerDropdown(teams[0]); 
  teamSelection.on("change", function() {
    updatePlayerDropdown(this.value);
  });
  playerSelection.on("change", function() {
    updateCharts(this.value);
  });
});
