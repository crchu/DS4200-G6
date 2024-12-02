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
const xSubScale = d3.scaleBand().padding(0.05);
const yScale = d3.scaleLinear().range([height, 0]);
const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

// Dropdown for team selection
const dropdown = d3.select("#dropdown")
    .append("select")
    .attr("id", "teamSelect");

// Load and process data
d3.csv("NBA_Players_2010.csv").then(data => {
    data.forEach(d => {
        d.pts = +d.pts * +d.gp; // Total points
        d.reb = +d.reb * +d.gp; // Total rebounds
        d.ast = +d.ast * +d.gp; // Total assists
    });

    // Get unique teams
    const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();

    // Populate dropdown
    dropdown.selectAll("option")
        .data(teams)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Filter and update chart
    function updateChart(selectedTeam) {
        // Group data by season for the selected team
        const filteredData = data.filter(d => d.team_abbreviation === selectedTeam);

        const groupedBySeason = d3.rollups(
            filteredData,
            v => ({
                pts: d3.sum(v, d => d.pts),
                reb: d3.sum(v, d => d.reb),
                ast: d3.sum(v, d => d.ast),
            }),
            d => d.season
        );

        // Flatten grouped data
        const flattenedData = groupedBySeason.map(([season, metrics]) => ({
            season,
            ...metrics
        }));

        const metrics = ["pts", "reb", "ast"];

        // Set scales
        xScale.domain(flattenedData.map(d => d.season));
        xSubScale.domain(metrics).range([0, xScale.bandwidth()]);
        yScale.domain([0, d3.max(flattenedData, d => Math.max(d.pts, d.reb, d.ast))]);

        // Clear existing chart
        svg.selectAll("*").remove();

        // Draw axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(10))
            .style("font-size", "12px");

        // Draw bars
        svg.append("g")
            .selectAll("g")
            .data(flattenedData)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${xScale(d.season)},0)`)
            .selectAll("rect")
            .data(d => metrics.map(key => ({ key, value: d[key] })))
            .enter()
            .append("rect")
            .attr("x", d => xSubScale(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", xSubScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", d => colorScale(d.key))
            .on("mouseover", function (event, d) {
                d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(`${d.key.toUpperCase()}: ${d.value}`)
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
            .style("font-size", "12px")
            .text(d => d.charAt(0).toUpperCase() + d.slice(1));
    }

    // Initial chart
    updateChart(teams[0]);

    // Update chart when dropdown changes
    dropdown.on("change", function () {
        updateChart(this.value);
    });
});
