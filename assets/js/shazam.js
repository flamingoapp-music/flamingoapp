// Define the JSON file paths for Apple Music
const appleMusicFilePaths = {
	"ww": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_global.json",

	// North America and Central America
	"us": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_us.json",
	"ca": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ca.json",
	"mx": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_mx.json",
	"cr": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_cr.json",

	// South America
	"ar": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ar.json",
	"br": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_br.json",
	"cl": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_cl.json",
	"co": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_co.json",
	"ec": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ec.json",
	"pe": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_pe.json",
	"uy": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_uy.json",
	"ve": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ve.json",

	// Europe
	"de": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_de.json",
	"fr": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_fr.json",
	"it": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_it.json",
	"es": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_es.json",
	"pt": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_pt.json",
	"be": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_be.json",
	"nl": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_nl.json",
	"pl": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_pl.json",
	"se": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_se.json",
	"no": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_no.json",
	"fi": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_fi.json",
	"ch": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ch.json",
	"at": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_at.json",
	"ie": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ie.json",

	// Asia
	"cn": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_cn.json",
	"jp": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_jp.json",
	"in": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_in.json",
	"kr": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_kr.json",
	"tw": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_tw.json",
	"sg": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_sg.json",
	"my": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_my.json",
	"th": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_th.json",
	"vn": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_vn.json",
	"ph": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ph.json",
	"id": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_id.json",

	// Africa
	"za": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_za.json",
	"ng": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ng.json",
	"eg": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_eg.json",
	"ke": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_ke.json",
	"gh": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_gh.json",

	// Oceania
	"au": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_au.json",
	"nz": "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_nz.json"
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
