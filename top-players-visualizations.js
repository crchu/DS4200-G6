// Load and process the CSV file
d3.csv("NBA_Players_2010.csv").then(data => {
  // Convert numeric fields
  data.forEach(d => {
    d.pts = +d.pts;
    d.reb = +d.reb;
    d.ast = +d.ast;
  });

  // Top 10 Players by Points Per Game
  const topPlayersPts = data.sort((a, b) => b.pts - a.pts).slice(0, 10);
  Plotly.newPlot('topPlayersPoints', [{
    x: topPlayersPts.map(d => d.player_name),
    y: topPlayersPts.map(d => d.pts),
    type: 'bar',
    marker: {
      color: 'skyblue'
    }
  }], {
    title: 'Top 10 Players by Points Per Game',
    xaxis: { title: 'Player Name', tickangle: -45 },
    yaxis: { title: 'Points Per Game' }
  });

  // Top 10 Players by Assists Per Game
  const topPlayersAst = data.sort((a, b) => b.ast - a.ast).slice(0, 10);
  Plotly.newPlot('topPlayersAssists', [{
    x: topPlayersAst.map(d => d.player_name),
    y: topPlayersAst.map(d => d.ast),
    type: 'bar',
    marker: {
      color: 'lightgreen'
    }
  }], {
    title: 'Top 10 Players by Assists Per Game',
    xaxis: { title: 'Player Name', tickangle: -45 },
    yaxis: { title: 'Assists Per Game' }
  });

  // Top 10 Players by Rebounds Per Game
  const topPlayersReb = data.sort((a, b) => b.reb - a.reb).slice(0, 10);
  Plotly.newPlot('topPlayersRebounds', [{
    x: topPlayersReb.map(d => d.player_name),
    y: topPlayersReb.map(d => d.reb),
    type: 'bar',
    marker: {
      color: 'lightcoral'
    }
  }], {
    title: 'Top 10 Players by Rebounds Per Game',
    xaxis: { title: 'Player Name', tickangle: -45 },
    yaxis: { title: 'Rebounds Per Game' }
  });
});