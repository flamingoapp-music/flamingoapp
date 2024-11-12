// Define the JSON file paths for Apple Music
const appleMusicFilePaths = {
	"index": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_global.json",

	// North America and Central America
	"us": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_us.json",
	"ca": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ca.json",
	"mx": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_mx.json",
	"bz": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_bz.json",
	"cr": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_cr.json",
	"sv": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_sv.json",
	"gt": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_gt.json",
	"hn": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_hn.json",
	"ni": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ni.json",
	"pa": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_pa.json",
	"do": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_do.json",

	// South America
	"ar": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ar.json",
	"bo": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_bo.json",
	"br": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_br.json",
	"cl": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_cl.json",
	"co": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_co.json",
	"ec": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ec.json",
	"py": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_py.json",
	"pe": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_pe.json",
	"uy": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_uy.json",
	"ve": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ve.json",

	// Europe
	"de": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_de.json",
	"fr": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_fr.json",
	"it": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_it.json",
	"es": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_es.json",
	"pt": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_pt.json",
	"be": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_be.json",
	"nl": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_nl.json",
	"pl": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_pl.json",
	"se": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_se.json",
	"no": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_no.json",
	"fi": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_fi.json",
	"ch": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ch.json",
	"at": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_at.json",
	"ie": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ie.json",

	// Asia
	"jp": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_jp.json",
	"in": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_in.json",
	"sg": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_sg.json",
	"my": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_my.json",
	"th": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_th.json",
	"ph": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ph.json",
	"id": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_id.json",

	// Africa
	"za": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_za.json",
	"ng": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ng.json",
	"eg": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_eg.json",
	"ke": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_ke.json",
	"gh": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_gh.json",

	// Oceania
	"au": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_au.json",
	"nz": "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_nz.json"
};


let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};

// Load data based on the selected Apple Music region
async function loadAppleMusicData(selectedRegion = "global") {
	const jsonFilePath = appleMusicFilePaths[selectedRegion];
	try {
		const response = await fetch(jsonFilePath);
		const data = await response.json();
		currentData = [...data];
		initialData = [...data];
		sortTableByPosition(currentData);
		displayedData = [...currentData];
		populateTable(displayedData);
		setUpEventListeners();
	} catch (error) {
		console.error("Failed to load Apple Music data:", error);
	}
}

// Populate the table with Apple Music data
function populateTable(data) {
	const tableBody = document.querySelector(".table tbody");
	tableBody.innerHTML = "";
	data.forEach((track, index) => {
		const row = document.createElement("tr");

		const indexCell = document.createElement("td");
		indexCell.textContent = index + 1;

		const positionCell = document.createElement("td");
		positionCell.textContent = track.Position;

		const titleCell = document.createElement("td");
		titleCell.textContent = track.Title;

		const artistCell = document.createElement("td");
		artistCell.textContent = track.Artist;

		row.appendChild(indexCell);
		row.appendChild(positionCell);
		row.appendChild(titleCell);
		row.appendChild(artistCell);

		tableBody.appendChild(row);
	});
}

// Set up event listeners for search and region selection
function setUpEventListeners() {
	document.getElementById("searchInput").addEventListener("input", performSearch);
	document.getElementById("homeButton").addEventListener("click", () => {
		document.getElementById("searchInput").value = "";
		resetTableToInitialState();
	});

	document.getElementById("displayselect").addEventListener("change", () => {
		loadAppleMusicData(document.getElementById("displayselect").value);
	});

	const headers = document.querySelectorAll(".table th");
	headers.forEach((header, index) => {
		sortDirection[index] = "asc";
		header.onclick = () => {
			toggleSortDirection(index);
			sortTableByColumn(index, currentData);
		};
	});
}

// Perform search based on the input
function performSearch() {
	const searchText = document.getElementById("searchInput").value.trim().toLowerCase();
	displayedData = initialData.filter(song => {
		return (
			(song.Title && song.Title.toLowerCase().includes(searchText)) ||
			(song.Artist && song.Artist.toLowerCase().includes(searchText))
		);
	});
	sortTableByPosition(displayedData);
	populateTable(displayedData);
}

// Toggle the sorting direction
function toggleSortDirection(columnIndex) {
	sortDirection[columnIndex] = sortDirection[columnIndex] === "asc" ? "desc" : "asc";
}

// Sort the table by the selected column
function sortTableByColumn(columnIndex, data) {
	const sortKeys = ["#", "Position", "Title", "Artist"];
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = sortKey === "Position";

	data.sort((a, b) => {
		let comparison = 0;
		if (isNumericSort) {
			comparison = (parseInt(a[sortKey]) || 0) - (parseInt(b[sortKey]) || 0);
		} else {
			comparison = (a[sortKey] || "").localeCompare(b[sortKey] || "");
		}
		return sortDirection[columnIndex] === "desc" ? -comparison : comparison;
	});

	populateTable(data);
}

// Sort the table by position (default sorting)
function sortTableByPosition(data) {
	data.sort((a, b) => parseInt(a.Position) - parseInt(b.Position));
}

// Reset the table to its initial state
function resetTableToInitialState() {
	currentData = [...initialData];
	sortTableByPosition(currentData);
	displayedData = [...currentData];
	populateTable(displayedData);
}

// Load data when the page is ready
document.addEventListener("DOMContentLoaded", () => {
	const displaySelect = document.getElementById("displayselect");
	loadAppleMusicData(displaySelect.value);
	setUpEventListeners();
});
