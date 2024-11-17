const jsonFilePaths = {
	"hot-100": "DATABASES/BILLBOARD/Billboard_hot100.json",
	"200": "DATABASES/BILLBOARD/Billboard_200.json",
	"Global-200": "DATABASES/BILLBOARD/Billboard_Global200.json"
};

let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};

// Load data based on the selected option
async function loadBillboardData(selectedOption = "hot-100") {
	const jsonFilePath = jsonFilePaths[selectedOption];
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
		console.error("Failed to load Billboard data:", error);
	}
}
function populateTable(data) {
	const tableBody = document.querySelector(".table tbody");
	tableBody.innerHTML = "";

	data.forEach((track, index) => {
		const row = document.createElement("tr");

		// Index Cell
		const indexCell = document.createElement("td");
		indexCell.textContent = index + 1;

		// Position Cell
		const positionCell = document.createElement("td");
		positionCell.textContent = track.Position;
		positionCell.classList.add("position-cell");

		// Cover Cell
		const coverCell = document.createElement("td");
		const img = document.createElement("img");
		img.src = track.Billboard_IMG || "images/flamingo%20logo.webp";
		img.alt = track.Title;
		img.classList.add("cover-image");
		coverCell.appendChild(img);

		// Title & Artist Cell
		const titleArtistCell = document.createElement("td");
		titleArtistCell.innerHTML = `
			<div class="title-artist">
				<span class="song-title">${track.Title || 'Not Available'}</span><br>
<span class="song-artist">${track.Artist || 'Not Available'}</span>
			</div>
		`;

		// Append cells to row
		row.appendChild(indexCell);
		row.appendChild(positionCell);
		row.appendChild(coverCell);
		row.appendChild(titleArtistCell);

		// Add row to table body
		tableBody.appendChild(row);
	});
}



// Set up event listeners for search and sorting
function setUpEventListeners() {
	document.getElementById("searchInput").addEventListener("input", performSearch);
	document.getElementById("homeButton").addEventListener("click", () => {
		document.getElementById("searchInput").value = "";
		resetTableToInitialState();
	});

	document.getElementById("displayselect").addEventListener("change", () => {
		loadBillboardData(document.getElementById("displayselect").value);
	});

	const headers = document.querySelectorAll(".table th");
	headers.forEach((header, index) => {
		// Skip sorting for the "Cover" column (index 2)
		if (index === 2) return;
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

function sortTableByColumn(columnIndex, data) {
	// Determine the sorting key based on the column index
	let sortKey;
	let isNumericSort = false;

	switch (columnIndex) {
		case 1: // Position column
			sortKey = "Position";
			isNumericSort = true;
			break;
		case 3: // Title column
			sortKey = "Title";
			break;
		case 4: // Artist column
			sortKey = "Artist";
			break;
		default:
			// Ignore other columns (e.g., Cover column at index 2)
			return;
	}

	// Sort the data based on the determined key and type
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
	loadBillboardData(displaySelect.value);
	setUpEventListeners();
});
