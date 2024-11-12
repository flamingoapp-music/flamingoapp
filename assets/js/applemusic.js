// Define the JSON file paths for Apple Music
const appleMusicFilePaths = {
	"index": "DATABASES/APPLE_MUSIC/apple_music_global.json",

	// North America and Central America
	"us": "DATABASES/APPLE_MUSIC/apple_music_us.json",
	"ca": "DATABASES/APPLE_MUSIC/apple_music_ca.json",
	"mx": "DATABASES/APPLE_MUSIC/apple_music_mx.json",
	"bz": "DATABASES/APPLE_MUSIC/apple_music_bz.json",
	"cr": "DATABASES/APPLE_MUSIC/apple_music_cr.json",
	"sv": "DATABASES/APPLE_MUSIC/apple_music_sv.json",
	"gt": "DATABASES/APPLE_MUSIC/apple_music_gt.json",
	"hn": "DATABASES/APPLE_MUSIC/apple_music_hn.json",
	"ni": "DATABASES/APPLE_MUSIC/apple_music_ni.json",
	"pa": "DATABASES/APPLE_MUSIC/apple_music_pa.json",
	"do": "DATABASES/APPLE_MUSIC/apple_music_do.json",
	"jm": "DATABASES/APPLE_MUSIC/apple_music_jm.json",
	"tt": "DATABASES/APPLE_MUSIC/apple_music_tt.json",
	"pr": "DATABASES/APPLE_MUSIC/apple_music_pr.json",

	// South America
	"ar": "DATABASES/APPLE_MUSIC/apple_music_ar.json",
	"bo": "DATABASES/APPLE_MUSIC/apple_music_bo.json",
	"br": "DATABASES/APPLE_MUSIC/apple_music_br.json",
	"cl": "DATABASES/APPLE_MUSIC/apple_music_cl.json",
	"co": "DATABASES/APPLE_MUSIC/apple_music_co.json",
	"ec": "DATABASES/APPLE_MUSIC/apple_music_ec.json",
	"py": "DATABASES/APPLE_MUSIC/apple_music_py.json",
	"pe": "DATABASES/APPLE_MUSIC/apple_music_pe.json",
	"uy": "DATABASES/APPLE_MUSIC/apple_music_uy.json",
	"ve": "DATABASES/APPLE_MUSIC/apple_music_ve.json",

	// Europe
	"gb": "DATABASES/APPLE_MUSIC/apple_music_gb.json",
	"de": "DATABASES/APPLE_MUSIC/apple_music_de.json",
	"fr": "DATABASES/APPLE_MUSIC/apple_music_fr.json",
	"it": "DATABASES/APPLE_MUSIC/apple_music_it.json",
	"es": "DATABASES/APPLE_MUSIC/apple_music_es.json",
	"pt": "DATABASES/APPLE_MUSIC/apple_music_pt.json",
	"be": "DATABASES/APPLE_MUSIC/apple_music_be.json",
	"nl": "DATABASES/APPLE_MUSIC/apple_music_nl.json",
	"pl": "DATABASES/APPLE_MUSIC/apple_music_pl.json",
	"se": "DATABASES/APPLE_MUSIC/apple_music_se.json",
	"no": "DATABASES/APPLE_MUSIC/apple_music_no.json",
	"fi": "DATABASES/APPLE_MUSIC/apple_music_fi.json",
	"ch": "DATABASES/APPLE_MUSIC/apple_music_ch.json",
	"at": "DATABASES/APPLE_MUSIC/apple_music_at.json",
	"ie": "DATABASES/APPLE_MUSIC/apple_music_ie.json",

	// Asia
	"cn": "DATABASES/APPLE_MUSIC/apple_music_cn.json",
	"jp": "DATABASES/APPLE_MUSIC/apple_music_jp.json",
	"in": "DATABASES/APPLE_MUSIC/apple_music_in.json",
	"kr": "DATABASES/APPLE_MUSIC/apple_music_kr.json",
	"sg": "DATABASES/APPLE_MUSIC/apple_music_sg.json",
	"my": "DATABASES/APPLE_MUSIC/apple_music_my.json",
	"th": "DATABASES/APPLE_MUSIC/apple_music_th.json",
	"ph": "DATABASES/APPLE_MUSIC/apple_music_ph.json",
	"id": "DATABASES/APPLE_MUSIC/apple_music_id.json",

	// Africa
	"za": "DATABASES/APPLE_MUSIC/apple_music_za.json",
	"ng": "DATABASES/APPLE_MUSIC/apple_music_ng.json",
	"eg": "DATABASES/APPLE_MUSIC/apple_music_eg.json",
	"ke": "DATABASES/APPLE_MUSIC/apple_music_ke.json",
	"gh": "DATABASES/APPLE_MUSIC/apple_music_gh.json",
	"ma": "DATABASES/APPLE_MUSIC/apple_music_ma.json",
	"dz": "DATABASES/APPLE_MUSIC/apple_music_dz.json",

	// Oceania
	"au": "DATABASES/APPLE_MUSIC/apple_music_au.json",
	"nz": "DATABASES/APPLE_MUSIC/apple_music_nz.json"
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
