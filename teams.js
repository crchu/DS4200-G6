const margin = { top: 50, right: 150, bottom: 50, left: 50 },
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleBand().range([0, width]).padding(0.2);
const yScale = d3.scaleLinear().range([height, 0]);
const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

// Axes
const xAxisGroup = svg.append("g")
    .attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g");

// Load data
d3.csv("NBA_Players_2010.csv").then(data => {
    // Process data
    data.forEach(d => {
        d.pts = +d.pts * +d.gp; // Total points
        d.reb = +d.reb * +d.gp; // Total rebounds
        d.ast = +d.ast * +d.gp; // Total assists
    });

    // Group data by team and season
    const groupedData = d3.rollups(
        data,
        v => ({
            pts: d3.sum(v, d => d.pts),
            reb: d3.sum(v, d => d.reb),
            ast: d3.sum(v, d => d.ast),
        }),
        d => d.team_abbreviation,
        d => d.season
    );

    // Flatten data for easier manipulation
    const flattenedData = [];
    groupedData.forEach(([team, seasons]) => {
        seasons.forEach(([season, metrics]) => {
            flattenedData.push({
                team,
                season,
                ...metrics
            });
        });
    });

    // Prepare data for stacked chart
    const metrics = ["pts", "reb", "ast"];
    const stackedData = d3.stack()
        .keys(metrics)
        (flattenedData);

    // Set scales
    const teams = Array.from(new Set(flattenedData.map(d => d.team)));
    const seasons = Array.from(new Set(flattenedData.map(d => d.season)));
    xScale.domain(flattenedData.map(d => d.season + " - " + d.team));
    yScale.domain([0, d3.max(flattenedData, d => d.pts + d.reb + d.ast)]);
    colorScale.domain(metrics);

    // Add axes
    xAxisGroup.call(d3.axisBottom(xScale).tickFormat(d => d.split(" - ")[0]).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");
    yAxisGroup.call(d3.axisLeft(yScale).ticks(10));

    // Draw bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.season + " - " + d.data.team))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mouseover", function (event, d) {
            const metric = stackedData.find(s => s.includes(d));
            const value = d[1] - d[0];
            const team = d.data.team;
            const season = d.data.season;
            d3.select("#tooltip")
                .style("visibility", "visible")
                .html(`
                    <strong>Team:</strong> ${team}<br>
                    <strong>Season:</strong> ${season}<br>
                    <strong>Metric:</strong> ${metric.key}<br>
                    <strong>Value:</strong> ${value}
                `)
                .style("top", `${event.pageY - 50}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", event => {
            d3.select("#tooltip")
                .style("top", `${event.pageY - 50}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("visibility", "hidden");
        });

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20},0)`)
        .selectAll("g")
        .data(metrics)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d.charAt(0).toUpperCase() + d.slice(1));
});
