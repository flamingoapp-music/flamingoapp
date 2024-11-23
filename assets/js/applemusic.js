let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};
let rowsToShow = 200;

document.addEventListener('DOMContentLoaded', function () {
	populateCountryDropdown();
	setUpEventListeners();
	loadData('us');
});

function loadData(country) {
	const jsonFile = `DATABASES/APPLE_MUSIC/apple_music_${country}.json`;

	Promise.all([
		fetch(jsonFile).then(response => response.json()),
		fetch(`DATABASES/APPLE_MUSIC/TS.json`).then(response => response.json()),
		fetch(`DATABASES/APPLE_MUSIC/SI.json`).then(response => response.json()),
		fetch(`DATABASES/APPLE_MUSIC/SP.json`).then(response => response.json())
	])
		.then(([amDataCountry, tsData, siData, spData]) => {
			currentData = mergeDataBySongID(amDataCountry, tsData, siData, spData);
			initialData = [...currentData];
			sortTableByPosition(currentData);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(amDataCountry, tsData, siData, spData) {
	const tsMap = Object.fromEntries(tsData.map(item => [item.SongID.toString(), item]));
	const siMap = Object.fromEntries(siData.map(item => [item.SongID.toString(), item]));
	const spMap = Object.fromEntries(spData.map(item => [item.SongID.toString(), item]));

	return amDataCountry.map(amEntry => {
		const songID = amEntry.SongID.toString();
		const tsEntry = tsMap[songID] || {};
		const siEntry = siMap[songID] || {};
		const spEntry = spMap[songID] || {};

		return {
			SongID: songID,
			Position: amEntry.Position,
			Title: siEntry.Title || 'Not Available',
			Artist: siEntry.Artist || 'Not Available',
			Album: tsEntry.Album || 'Not Available',
			Duration: tsEntry.Duration || 'Not Available',
			ReleaseDate: tsEntry.ReleaseDate ? tsEntry.ReleaseDate.substring(0, 4) : 'Not Available',
			Genre: tsEntry.Genre || 'Not Available',
			CoverImage: tsEntry.CoverImage || 'images/default_cover_image.jpg',
			Spotify_URL: spEntry.Spotify_URL || null
		};
	});
}

function setUpEventListeners() {
	const countrySelect = document.getElementById('countrySelect');
	if (countrySelect) {
		countrySelect.addEventListener('change', function () {
			const selectedCountry = countrySelect.value;
			loadData(selectedCountry);
		});
	}

	document.getElementById('searchInput').addEventListener('input', performSearch);
	document.getElementById('homeButton').addEventListener('click', resetTableToInitialState);

	const headers = document.querySelectorAll('.table th');
	headers.forEach((header, index) => {
		sortDirection[index] = 'asc';
		header.onclick = () => {
			toggleSortDirection(index);
			sortTableByColumn(index, currentData);
		};
	});
}

function resetTableToInitialState() {
	currentData = [...initialData];
	sortTableByPosition(currentData);
	displayedData = getLimitedData(currentData, rowsToShow);
	populateTable(displayedData);
	document.getElementById('searchInput').value = '';
}

function performSearch() {
	const category = document.getElementById('searchCategory').value.toLowerCase();
	const searchText = document.getElementById('searchInput').value.trim().toLowerCase();

	displayedData = initialData.filter(song => {
		if (category === 'title' && song.Title && song.Title.toLowerCase().includes(searchText)) return true;
		if (category === 'artist' && song.Artist && song.Artist.toLowerCase().includes(searchText)) return true;
		if (category === 'album' && song.Album && song.Album.toLowerCase().includes(searchText)) return true;
		if (category === 'genre' && song.Genre && song.Genre.toLowerCase().includes(searchText)) return true;
		return false;
	});

	sortTableByPosition(displayedData);
	displayedData = getLimitedData(displayedData, rowsToShow);
	populateTable(displayedData);
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
                    <span class="song-title">${song.Title}</span><br>
                    <span class="song-artist">${song.Artist}</span>
                </div>
            </td>
            <td>${song.Album}</td>
            <td>${song.Duration}</td>
            <td>${song.ReleaseDate}</td>
            <td>${song.Genre}</td>
        `;
		row.addEventListener('click', () => {
			selectSingleRow(row);
		});
		tableBody.appendChild(row);
	});
}

function selectSingleRow(row) {
	const selectedRow = document.querySelector('.table tbody .selected');
	if (selectedRow) selectedRow.classList.remove('selected');
	row.classList.add('selected');
	updateTopSection(row.songData);
}

function updateTopSection(song) {
	document.getElementById('topTitle').textContent = song.Title || 'Title';
	document.getElementById('topArtist').textContent = song.Artist || 'Artist';
	document.getElementById('topAlbum').textContent = song.Album || 'Album';

	const coverImage = song.CoverImage || 'images/default_cover_image.jpg';
	document.getElementById('topImage').src = coverImage;

	const spotifyButton = document.getElementById('spotifyButton');
	if (song.Spotify_URL) {
		spotifyButton.href = song.Spotify_URL;
		spotifyButton.style.display = 'inline-block';
	} else {
		spotifyButton.style.display = 'none';
	}
}

function sortTableByPosition(data) {
	data.sort((a, b) => parseInt(a.Position) - parseInt(b.Position));
}

function sortTableByColumn(columnIndex, data) {
	const sortKeys = ['#', 'Position', 'Title', 'Album', 'Duration', 'ReleaseDate', 'Genre'];
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = ['Position', 'Duration', 'ReleaseDate'].includes(sortKey);

	data.sort((a, b) => {
		const comparison = isNumericSort ? sortNumerically(a, b, sortKey) : (a[sortKey] || '').localeCompare(b[sortKey] || '');
		return sortDirection[columnIndex] === 'desc' ? -comparison : comparison;
	});

	populateTable(data);
}

function toggleSortDirection(columnIndex) {
	sortDirection[columnIndex] = sortDirection[columnIndex] === 'asc' ? 'desc' : 'asc';
}

function sortNumerically(a, b, key) {
	if (key === 'Duration') return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
	if (key === 'ReleaseDate') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
	if (key === 'Position') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
	return 0;
}

function convertDurationToSeconds(duration) {
	if (!duration) return 0;
	const [minutes, seconds] = duration.split(':').map(Number);
	return minutes * 60 + seconds;
}

function getLimitedData(data, limit) {
	return data.slice(0, limit);
}

function populateCountryDropdown() {
	const countrySelect = document.getElementById('countrySelect');
	if (countrySelect) {
		countrySelect.innerHTML = `
            <!-- North America & Caribbean -->
            <optgroup label="North America & Caribbean">
                <option value="us" selected>United States - 🇺🇸</option>
                <option value="ca">Canada - 🇨🇦</option>
                <option value="mx">Mexico - 🇲🇽</option>
                <!-- Add other countries as needed -->
            </optgroup>
            <!-- Other regions... -->
        `;
	}
}
