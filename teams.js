const margin = { top: 50, right: 150, bottom: 50, left: 50 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const attributes = ['pts', 'reb', 'ast']; // Attributes to visualize
const attributeTitles = {
    pts: "Total Points",
    reb: "Total Rebounds",
    ast: "Total Assists"
};

// Create SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add scales and axes
const xScale = d3.scalePoint()
    .range([0, width])
    .padding(0.5);

const yScale = d3.scaleLinear()
    .range([height, 0]);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Unique color for each team

const xAxisGroup = svg.append("g")
    .attr("transform", `translate(0,${height})`);

const yAxisGroup = svg.append("g");

// Add title
const title = svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold");

// Add tooltip
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.8)")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

// Load data
d3.csv("NBA_Players_2010.csv").then(data => {
    // Process data
    data.forEach(d => {
        d.pts = +d.pts * +d.gp; // Total points
        d.reb = +d.reb * +d.gp; // Total rebounds
        d.ast = +d.ast * +d.gp; // Total assists
    });

    const seasons = Array.from(new Set(data.map(d => d.season))).sort();
    const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();

    // Group data by team and season
    const groupedData = d3.group(data, d => d.team_abbreviation);

    // Update xScale and colorScale domains
    xScale.domain(seasons);
    colorScale.domain(teams);

    // Function to update chart for a selected attribute
    function updateChart(attribute) {
        const maxVal = d3.max(data, d => d[attribute]);
        yScale.domain([0, maxVal]);

        // Update axes
        xAxisGroup.transition().duration(1000).call(d3.axisBottom(xScale));
        yAxisGroup.transition().duration(1000).call(d3.axisLeft(yScale));

        // Update title
        title.text(attributeTitles[attribute]);

        // Bind data
        const lines = svg.selectAll(".line")
            .data(teams, d => d);

        // Update existing lines
        lines.transition().duration(1000)
            .attr("d", team => {
                const teamData = groupedData.get(team);
                const line = d3.line()
                    .x(d => xScale(d.season))
                    .y(d => yScale(d[attribute]));
                return line(teamData);
            });

        // Enter new lines
        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", team => colorScale(team))
            .attr("stroke-width", 2)
            .attr("d", team => {
                const teamData = groupedData.get(team);
                const line = d3.line()
                    .x(d => xScale(d.season))
                    .y(d => yScale(d[attribute]));
                return line(teamData);
            })
            .on("mouseover", function (event, team) {
                d3.select(this).attr("stroke-width", 4);
                tooltip.style("visibility", "visible").text(team);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 2);
                tooltip.style("visibility", "hidden");
            });

        // Remove old lines
        lines.exit().remove();
    }

    // Initial render
    updateChart("pts");

    // Add buttons to switch between attributes
    d3.select("#buttons").selectAll("button")
        .data(attributes)
        .enter()
        .append("button")
        .text(attr => attributeTitles[attr])
        .on("click", attr => updateChart(attr));
});
