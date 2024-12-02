// Ensure your script runs after the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    const margin = { top: 50, right: 150, bottom: 50, left: 50 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const attributes = ['pts', 'reb', 'ast'];
    const attributeTitles = {
        pts: "Total Points",
        reb: "Total Rebounds",
        ast: "Total Assists"
    };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scalePoint()
        .range([0, width])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`);

    const yAxisGroup = svg.append("g");

    const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    d3.csv("all_seasons_9.csv").then(data => {
        data.forEach(d => {
            d.pts = +d.pts * +d.gp;
            d.reb = +d.reb * +d.gp;
            d.ast = +d.ast * +d.gp;
        });

        const seasons = Array.from(new Set(data.map(d => d.season))).sort();
        const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();

        const groupedData = d3.group(data, d => d.team_abbreviation);

        xScale.domain(seasons);
        colorScale.domain(teams);

        function updateChart(attribute) {
            const maxVal = d3.max(data, d => d[attribute]);
            yScale.domain([0, maxVal]);

            xAxisGroup.transition().duration(1000).call(d3.axisBottom(xScale));
            yAxisGroup.transition().duration(1000).call(d3.axisLeft(yScale));

            const lines = svg.selectAll(".line")
                .data(teams, d => d);

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
                .merge(lines)
                .transition()
                .duration(1000)
                .attr("d", team => {
                    const teamData = groupedData.get(team);
                    const line = d3.line()
                        .x(d => xScale(d.season))
                        .y(d => yScale(d[attribute]));
                    return line(teamData);
                });

            lines.exit().remove();

            title.text(attributeTitles[attribute]);
        }

        // Initial render
        updateChart("pts");

        // Add buttons
        d3.select("#buttons").selectAll("button")
            .data(attributes)
            .enter()
            .append("button")
            .text(attr => attributeTitles[attr])
            .on("click", attr => {
                console.log("Button clicked:", attr);
                updateChart(attr);
            });
    });
});
