// Updated Visualization for Top 10 Players
d3.csv("NBA_Players.csv").then(data => {
  // Convert numeric fields
  data.forEach(d => {
    d.pts = +d.pts;
    d.reb = +d.reb;
    d.ast = +d.ast;
  });

  // Top 10 Players by Points Per Game
  const topPlayersPts = [
    { player_name: "James Harden", pts: 36.1 },
    { player_name: "James Harden", pts: 34.3 },
    { player_name: "Joel Embiid", pts: 33.1 },
    { player_name: "Luka Doncic", pts: 32.4 },
    { player_name: "Damian Lillard", pts: 32.2 },
    { player_name: "Kevin Durant", pts: 32.0 },
    { player_name: "Stephen Curry", pts: 32.0 },
    { player_name: "Russell Westbrook", pts: 31.6 },
    { player_name: "Shai Gilgeous-Alexander", pts: 31.4 },
    { player_name: "Bradley Beal", pts: 31.3 }
  ];
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
  const topPlayersAst = [
    { player_name: "Rajon Rondo", ast: 11.7 },
    { player_name: "Rajon Rondo", ast: 11.7 },
    { player_name: "Russell Westbrook", ast: 11.7 },
    { player_name: "Chris Paul", ast: 11.6 },
    { player_name: "Rajon Rondo", ast: 11.2 },
    { player_name: "James Harden", ast: 11.2 },
    { player_name: "Rajon Rondo", ast: 11.1 },
    { player_name: "Chris Paul", ast: 11.0 },
    { player_name: "James Harden", ast: 10.8 },
    { player_name: "Chris Paul", ast: 10.8 }
  ];
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
  const topPlayersReb = [
    { player_name: "Andre Drummond", reb: 16.0 },
    { player_name: "Andre Drummond", reb: 15.6 },
    { player_name: "Kevin Love", reb: 15.2 },
    { player_name: "DeAndre Jordan", reb: 15.2 },
    { player_name: "Andre Drummond", reb: 15.2 },
    { player_name: "DeAndre Jordan", reb: 15.0 },
    { player_name: "Andre Drummond", reb: 14.8 },
    { player_name: "Rudy Gobert", reb: 14.7 },
    { player_name: "Clint Capela", reb: 14.3 },
    { player_name: "Hassan Whiteside", reb: 14.1 }
  ];
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
