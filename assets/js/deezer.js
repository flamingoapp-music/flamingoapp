// Define the JSON file paths for Apple Music
const appleMusicFilePaths = {
	"ww": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_global.json",

	// North America and Central America
	"us": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_us.json",
	"ca": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ca.json",
	"mx": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_mx.json",
	"cr": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_cr.json",
	"sv": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_sv.json",
	"gt": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_gt.json",
	"hn": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_hn.json",
	"jm": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_jm.json",

	// South America
	"ar": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ar.json",
	"br": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_br.json",
	"cl": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_cl.json",
	"co": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_co.json",
	"ec": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ec.json",
	"py": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_py.json",
	"pe": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_pe.json",
	"ve": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ve.json",
	"bo": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_bo.json",

	// Europe
	"de": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_de.json",
	"fr": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_fr.json",
	"it": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_it.json",
	"es": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_es.json",
	"pt": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_pt.json",
	"be": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_be.json",
	"nl": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_nl.json",
	"pl": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_pl.json",
	"se": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_se.json",
	"no": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_no.json",
	"fi": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_fi.json",
	"ch": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ch.json",
	"at": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_at.json",
	"ie": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ie.json",

	// Asia
	"jp": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_jp.json",
	"kr": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_kr.json",
	"sg": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_sg.json",
	"my": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_my.json",
	"th": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_th.json",
	"ph": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ph.json",
	"id": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_id.json",

	// Africa
	"za": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_za.json",
	"ng": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ng.json",
	"eg": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_eg.json",
	"ke": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_ke.json",
	"gh": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_gh.json",

	// Oceania
	"au": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_au.json",
	"nz": "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_nz.json"
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
