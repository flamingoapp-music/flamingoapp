let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};

document.addEventListener('DOMContentLoaded', function() {
	loadDataTop();
	setUpEventListeners();
});

function loadDataTop() {
	Promise.all([
		fetch('DATABASES/SPOTIFY/top/SP_top.json').then(response => response.json()),
		fetch('DATABASES/SPOTIFY/top/TS.json').then(response => response.json()),
		fetch('DATABASES/SPOTIFY/top/SI.json').then(response => response.json()),
		fetch('DATABASES/SPOTIFY/top/SP.json').then(response => response.json())
	])
		.then(([spData, tsData, siData, spDataGlobal]) => {
			currentData = mergeDataBySongID(spData, tsData, siData, spDataGlobal);
			initialData = [...currentData];
			sortTableByPosition(currentData);
			displayedData = [...currentData];
			populateTable(displayedData);
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(spData, tsData, siData, spDataGlobal) {
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

	return spData.map(spEntry => {
		const songID = spEntry.SongID.toString();
		const tsEntry = tsMap[songID] || {};
		const siEntry = siMap[songID] || {};
		const spEntryGlobal = spMap[songID] || {};

		return {
			SongID: songID,
			Position: spEntry.Position,
			Title: siEntry.Title,
			Artist: siEntry.Artist,
			Album: tsEntry.Album,
			Duration: tsEntry.Duration,
			ReleaseDate: tsEntry.ReleaseDate,
			Genre: tsEntry.Genre,
			Streams: spEntry.Streams || 0,
			CoverImage: tsEntry.CoverImage,
			Spotify_URL: spEntryGlobal.Spotify_URL || null
		};
	});
}

function setUpEventListeners() {
	const searchInput = document.getElementById('searchInput');
	searchInput.addEventListener('input', performSearch);

	const homeButton = document.getElementById('homeButton');
	homeButton.addEventListener('click', function() {
		searchInput.value = '';
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
	const sortKeys = ['#', 'Position', 'Title', 'Streams', 'Album', 'Duration', 'ReleaseDate', 'Genre'];
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = ['Position', 'Streams', 'Duration', 'ReleaseDate'].includes(sortKey);

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
	if (key === 'Streams') return a[key] - b[key];
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
            <td>${formatStreams(song.Streams)}</td>
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
	if (song.Spotify_URL) {
		spotifyButton.href = song.Spotify_URL;
		spotifyButton.style.display = 'inline-block';
	} else {
		spotifyButton.style.display = 'none';
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
		if (category === 'title' && song.Title && song.Title.toLowerCase().includes(searchText)) return true;
		if (category === 'artist' && song.Artist && song.Artist.toLowerCase().includes(searchText)) return true;
		if (category === 'album' && song.Album && song.Album.toLowerCase().includes(searchText)) return true;
		if (category === 'genre' && song.Genre && song.Genre.toLowerCase().includes(searchText)) return true;
		return false;
	});

	sortTableByPosition(displayedData);
	populateTable(displayedData);
}

function formatStreams(streams) {
	return `${(streams / 1_000_000).toFixed(2)}M`;
}

function convertDurationToSeconds(duration) {
	if (!duration) return 0;
	const [minutes, seconds] = duration.split(':').map(Number);
	return minutes * 60 + seconds;
}
