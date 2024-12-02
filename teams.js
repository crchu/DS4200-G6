const csvFilePath = "NBA_Players_2010.csv";

function initializeComparisonCharts() {
  fetch(csvFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch CSV: " + response.statusText);
      }
      return response.text();
    })
    .then((csvData) => {
      const parsedData = Papa.parse(csvData, { header: true }).data;

      // Filter and process valid rows
      const processedData = parsedData
        .filter((row) => row.team_abbreviation && row.season)
        .map((row) => ({
          team_abbreviation: row.team_abbreviation.trim(),
          season: row.season.trim(),
          pts: parseFloat(row.pts || 0),
          gp: parseInt(row.gp || 0),
          reb: parseFloat(row.reb || 0),
          ast: parseFloat(row.ast || 0)
        }));

      // Extract unique teams and seasons
      const teams = [...new Set(processedData.map((row) => row.team_abbreviation))].sort();
      const seasons = [...new Set(processedData.map((row) => row.season))].sort();

      // Populate dropdowns
      populateDropdown("teamSelect", teams);
      populateDropdown("seasonSelect", seasons);

      // Event listeners for charts
      document.getElementById("teamSelect").addEventListener("change", () => updateCharts(processedData));
      document.getElementById("seasonSelect").addEventListener("change", () => updateCharts(processedData));
    })
    .catch((error) => console.error("Error:", error));
}

function populateDropdown(dropdownId, options) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = '<option value="">-- Select an Option --</option>';
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    dropdown.appendChild(opt);
  });
}

function updateCharts(data) {
  const team = document.getElementById("teamSelect").value;
  const season = document.getElementById("seasonSelect").value;

  if (!team || !season) {
    console.log("Please select both a team and a season.");
    return;
  }

  const filteredData = data.filter((row) => row.team_abbreviation === team && row.season === season);

  const totalPoints = filteredData.reduce((sum, row) => sum + row.pts, 0);
  const totalRebounds = filteredData.reduce((sum, row) => sum + row.reb, 0);
  const totalAssists = filteredData.reduce((sum, row) => sum + row.ast, 0);

  console.log("Chart Data:", { totalPoints, totalRebounds, totalAssists });
  // Add chart rendering logic here
}

// Initialize charts
initializeComparisonCharts();
