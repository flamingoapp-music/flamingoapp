// spotify.js

let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};

document.addEventListener('DOMContentLoaded', function() {
	const dataFolder = getDataFolder();
	if (dataFolder === 'top') {
		loadDataTop();
		const countryContainer = document.querySelector('.dropdown-container');
		if (countryContainer) {
			countryContainer.style.display = 'none';
		}
	} else {
		loadData('global');
		setUpCountryDropdown();
	}
});

function getDataFolder() {
	const path = window.location.pathname;
	if (path.includes('spotifyChartsWeekly.html')) {
		return 'weekly';
	} else if (path.includes('spotifyChartsDaily.html')) {
		return 'daily';
	} else if (path.includes('spotifyTopSongs.html')) {
		return 'top';
	} else {
		return 'weekly';
	}
}

function loadData(country) {
	const dataFolder = getDataFolder();
	const jsonFile = `DATABASES/SPOTIFY/${dataFolder}/SP_${country}.json`;

	Promise.all([
		fetch(jsonFile).then(response => response.json()),
		fetch(`DATABASES/SPOTIFY/${dataFolder}/TS.json`).then(response => response.json()),
		fetch(`DATABASES/SPOTIFY/${dataFolder}/UF.json`).then(response => response.json())
	])
		.then(([spData, tsData, ufData]) => {
			currentData = mergeDataBySongID(spData, tsData, ufData);
			initialData = [...currentData];
			sortTableByPosition(currentData);
			displayedData = [...currentData];
			populateTable(displayedData);
			setUpEventListeners();
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function loadDataTop() {
	const dataFolder = 'top';

	Promise.all([
		fetch(`DATABASES/SPOTIFY/${dataFolder}/SP_top.json`).then(response => response.json()),
		fetch(`DATABASES/SPOTIFY/${dataFolder}/TS.json`).then(response => response.json()),
		fetch(`DATABASES/SPOTIFY/${dataFolder}/UF.json`).then(response => response.json())
	])
		.then(([spData, tsData, ufData]) => {
			spData = spData.map(entry => {
				entry.SongID = entry.Song_ID;
				delete entry.Song_ID;
				return entry;
			});

			currentData = mergeDataBySongID(spData, tsData, ufData);
			initialData = [...currentData];
			sortTableByPosition(currentData);
			displayedData = [...currentData];
			populateTable(displayedData);
			setUpEventListeners();
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function setUpCountryDropdown() {
	const countrySelect = document.getElementById('countrySelect');
	const countryOptions = document.getElementById('countryOptions');

	countrySelect.addEventListener('click', () => {
		countryOptions.style.display = countryOptions.style.display === 'none' ? 'block' : 'none';
	});

	document.addEventListener('click', (event) => {
		if (!event.target.closest('.dropdown-container')) {
			countryOptions.style.display = 'none';
		}
	});

	countryOptions.addEventListener('click', (event) => {
		if (event.target.matches('div')) {
			countrySelect.value = event.target.textContent.trim();
			countryOptions.style.display = 'none';
			const selectedCountry = event.target.getAttribute('value');
			filterByCountry(selectedCountry);
		}
	});
}

function filterByCountry(countryCode) {
	loadData(countryCode);
}

function mergeDataBySongID(spData, tsData, ufData) {
	return spData.map(spEntry => {
		const tsEntry = tsData.find(ts => ts.SongID === spEntry.SongID) || {};
		const ufEntry = ufData.find(uf => uf.SongID === spEntry.SongID) || {};
		return { ...spEntry, ...tsEntry, ...ufEntry };
	});
}

function setUpEventListeners() {
	document.getElementById('searchInput').addEventListener('input', performSearch);
	document.getElementById('homeButton').addEventListener('click', function() {
		document.getElementById('searchInput').value = '';
		resetTableToInitialState();
	});

	const headers = document.querySelectorAll('.table th');
	headers.forEach((header, index) => {
		sortDirection[index] = 'asc';
		header.onclick = () => {
			toggleSortDirection(index);
			sortTableByColumn(index, currentData);
		};
	});
}

function toggleSortDirection(columnIndex) {
	sortDirection[columnIndex] = sortDirection[columnIndex] === 'asc' ? 'desc' : 'asc';
}

function sortTableByColumn(columnIndex, data) {
	const sortKeys = ['#', 'Position', 'Title', 'Album', 'Duration', 'ReleaseDate', 'Genre'];
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = ['Position', 'Duration', 'ReleaseDate'].includes(sortKey);

	data.sort((a, b) => {
		let comparison = 0;
		if (isNumericSort) {
			comparison = sortNumerically(a, b, sortKey);
		} else {
			comparison = (a[sortKey] || "").localeCompare(b[sortKey] || "");
		}
		return sortDirection[columnIndex] === 'desc' ? -comparison : comparison;
	});

	populateTable(data);
}

function sortNumerically(a, b, key) {
	if (key === 'Duration') return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
	if (key === 'ReleaseDate') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
	return (a[key] || 0) - (b[key] || 0);
}

function sortTableByPosition(data) {
	data.sort((a, b) => a.Position - b.Position);
}

function populateTable(data) {
	const tableBody = document.querySelector('.table tbody');
	tableBody.innerHTML = '';
	data.forEach((song, index) => {
		const row = document.createElement('tr');
		row.songData = song;
		row.innerHTML = `
            <td>${index + 1}</td>
            <td>${song.Position || 'N/A'}</td>
            <td>
                <div class="title-artist">
                    <span class="song-title">${song.Title || 'Not Available'}</span><br>
                    <span class="song-artist">${song.Artist || 'Not Available'}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
            <td>${song.Genre || 'Not Available'}</td>
        `;

		row.addEventListener('click', () => selectSingleRow(row, tableBody));
		tableBody.appendChild(row);
	});
}

function selectSingleRow(row, tableBody) {
	const currentlySelected = tableBody.querySelector('.selected');
	if (currentlySelected) {
		currentlySelected.classList.remove('selected');
	}

	row.classList.add('selected');
	updateTopSection(row.songData);
}


function updateTopSection(song) {
	document.getElementById('topTitle').textContent = song.Title || 'Title';
	document.getElementById('topArtist').textContent = song.Artist || 'Artist';
	document.getElementById('topAlbum').textContent = song.Album || 'Album';

	const coverImage = song.CoverImage || 'images/flamingo%20logo.webp';
	document.getElementById('topImage').src = coverImage;

	const spotifyButton = document.getElementById('spotifyButton');
	const dataFolder = getDataFolder();
	if (dataFolder === 'top') {
		spotifyButton.style.display = 'none';
	} else {
		if (song.Spotify_URL) {
			spotifyButton.href = song.Spotify_URL;
			spotifyButton.style.display = 'inline-block';
		} else {
			spotifyButton.style.display = 'none';
		}
	}
}

function resetTableToInitialState() {
	currentData = [...initialData];
	sortTableByPosition(currentData);
	displayedData = [...currentData];
	populateTable(displayedData);
}

function performSearch() {
	const category = document.getElementById('searchCategory').value.toLowerCase();
	const searchText = document.getElementById('searchInput').value.trim().toLowerCase();

	displayedData = initialData.filter(song => {
		if (category === 'title' && song.Title.toLowerCase().includes(searchText)) return true;
		if (category === 'artist' && song.Artist.toLowerCase().includes(searchText)) return true;
		if (category === 'album' && song.Album && song.Album.toLowerCase().includes(searchText)) return true;
		if (category === 'genre' && song.Genre && song.Genre.toLowerCase().includes(searchText)) return true;
		return false;
	});

	sortTableByPosition(displayedData);
	populateTable(displayedData);
}

function convertDurationToSeconds(duration) {
	if (!duration) return 0;
	const [minutes, seconds] = duration.split(':').map(Number);
	return minutes * 60 + seconds;
}
