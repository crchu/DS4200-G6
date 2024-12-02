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
const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g");

// Tooltip for interaction
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.9)")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

d3.csv("NBA_Players_2010.csv").then(data => {
    console.log("Data Loaded:", data);

    // Data preparation
    data.forEach(d => {
        d.pts = +d.pts * +d.gp; // Total points
        d.reb = +d.reb * +d.gp; // Total rebounds
        d.ast = +d.ast * +d.gp; // Total assists
    });

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

    console.log("Grouped Data:", groupedData);

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

    console.log("Flattened Data:", flattenedData);

    const metrics = ["pts", "reb", "ast"];
    const stackedData = d3.stack()
        .keys(metrics)
        (flattenedData);

    console.log("Stacked Data:", stackedData);

    const seasons = Array.from(new Set(flattenedData.map(d => d.season))).sort();
    xScale.domain(flattenedData.map(d => d.season + " - " + d.team));
    yScale.domain([0, d3.max(flattenedData, d => d.pts + d.reb + d.ast)]);
    colorScale.domain(metrics);

    xAxisGroup.call(d3.axisBottom(xScale).tickFormat(d => d.split(" - ")[0]).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px");
    yAxisGroup.call(d3.axisLeft(yScale).ticks(10));

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
            const value = d[1] - d[0];
            d3.select("#tooltip")
                .style("visibility", "visible")
                .html(`Value: ${value}`)
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
});
