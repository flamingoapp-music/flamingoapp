let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};
let rowsToShow = 200;
let pageType = '';

document.addEventListener('DOMContentLoaded', function () {
	pageType = getPageType();

	if (pageType === 'insights') {
		const countrySelect = document.getElementById('countrySelect');
		if (countrySelect) {
			populateCountryDropdown();
			loadData('us');
			countrySelect.addEventListener('change', function () {
				const selectedCountry = countrySelect.value;
				loadData(selectedCountry);
			});
		}
	}

	const displaySelect = document.getElementById('displayselect');
	if (displaySelect) {
		displaySelect.addEventListener('change', function () {
			rowsToShow = this.value === 'All' ? initialData.length : parseInt(this.value);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
		});
	}
});

function getPageType() {
	const path = window.location.pathname;
	if (path.includes('youtubeInsights.html')) {
		return 'insights';
	}
	return 'unknown';
}

function getDataFolder() {
	return pageType;
}

function loadData(country) {
	const dataFolder = getDataFolder();
	const jsonFile = `DATABASES/YOUTUBE/${dataFolder}/YT_${country}.json`;

	Promise.all([
		fetch(jsonFile).then(response => response.json()),
		fetch(`DATABASES/YOUTUBE/${dataFolder}/TS.json`).then(response => response.json()),
		fetch(`DATABASES/YOUTUBE/${dataFolder}/SI.json`).then(response => response.json()),
		fetch(`DATABASES/YOUTUBE/${dataFolder}/SP.json`).then(response => response.json())
	])
		.then(([ytDataCountry, tsData, siData, spData]) => {
			currentData = mergeDataBySongID(ytDataCountry, tsData, siData, spData);
			initialData = [...currentData];
			sortTableByPosition(currentData);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
			setUpEventListeners();
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(ytDataCountry, tsData, siData, spDataGlobal) {
	const tsMap = {};
	tsData.forEach(item => {
		tsMap[item.SongID.toString()] = item;
	});

	const siMap = {};
	siData.forEach(item => {
		siMap[item.SongID.toString()] = item;
	});

	const spMap = {};
	spDataGlobal.forEach(item => {
		spMap[item.SongID.toString()] = item;
	});

	return ytDataCountry.map(ytEntry => {
		const songID = ytEntry.SongID.toString();

		const tsEntry = tsMap[songID] || {};
		const siEntry = siMap[songID] || {};
		const spEntryGlobal = spMap[songID] || {};

		return {
			SongID: songID,
			Position: ytEntry.Position,
			Title: siEntry.Title,
			Artist: siEntry.Artist,
			Album: tsEntry.Album,
			Duration: tsEntry.Duration,
			ReleaseDate: tsEntry.ReleaseDate,
			Genre: tsEntry.Genre,
			CoverImage: tsEntry.CoverImage,
			Spotify_URL: spEntryGlobal.Spotify_URL
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
                    <span class="song-title">${song.Title || 'Not Available'}</span><br>
                    <span class="song-artist">${song.Artist || 'Not Available'}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${song.Duration || 'Not Available'}</td>
            <td>${song.ReleaseDate ? song.ReleaseDate.substring(0, 4) : 'Not Available'}</td>
            <td>${song.Genre || 'Not Available'}</td>
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
	if (key === 'ReleaseDate') return parseInt(a[key]?.substring(0, 4) || 0) - parseInt(b[key]?.substring(0, 4) || 0);
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
		const countries = [

		];

		countries.forEach(country => {
			const option = document.createElement('option');
			option.value = country.code;
			option.textContent = country.name;
			if (country.code === 'us') option.selected = true;
			countrySelect.appendChild(option);
		});
	}
}

function setUpEventListeners() {
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
