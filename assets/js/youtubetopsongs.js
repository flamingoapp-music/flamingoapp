let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};
let rowsToShow = 200;

document.addEventListener('DOMContentLoaded', function () {
	loadData();
	setUpEventListeners();
});

function loadData() {
	const dataFolder = 'top_songs';
	const arFile = `DATABASES/YOUTUBE/${dataFolder}/AR.json`;
	const tsFile = `DATABASES/YOUTUBE/${dataFolder}/TS.json`;
	const ufFile = `DATABASES/YOUTUBE/${dataFolder}/UF.json`;

	Promise.all([
		fetch(arFile).then(response => response.json()),
		fetch(tsFile).then(response => response.json()),
		fetch(ufFile).then(response => response.json())
	])
		.then(([arData, tsData, ufData]) => {
			currentData = mergeDataBySongID(arData, tsData, ufData);
			initialData = [...currentData];
			sortTableByViews(currentData);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(arData, tsData, ufData) {
	return tsData.map(tsEntry => {
		const arEntry = arData.find(ar => ar.SongID === tsEntry.SongID) || {};
		const ufEntry = ufData.find(uf => uf.SongID === tsEntry.SongID) || {};
		return { ...tsEntry, ...arEntry, ...ufEntry };
	});
}

function setUpEventListeners() {
	document.getElementById('searchInput').addEventListener('input', performSearch);
	document.getElementById('homeButton').addEventListener('click', resetTableToInitialState);

	// Event listener for the display selection dropdown
	const displaySelect = document.getElementById('displayselext');
	if (displaySelect) {
		displaySelect.addEventListener('change', function () {
			updateRowsToShow(this.value);
		});
	}

	const headers = document.querySelectorAll('.table th');
	headers.forEach((header, index) => {
		sortDirection[index] = 'asc';
		header.onclick = () => {
			toggleSortDirection(index);
			sortTableByColumn(index, displayedData);
		};
	});
}

function updateRowsToShow(value) {
	rowsToShow = value === 'All' ? initialData.length : parseInt(value);
	displayedData = getLimitedData(currentData, rowsToShow);
	populateTable(displayedData);
}

function resetTableToInitialState() {
	currentData = [...initialData];
	sortTableByViews(currentData);
	displayedData = getLimitedData(currentData, rowsToShow);
	populateTable(displayedData);
	document.getElementById('searchInput').value = '';
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

	sortTableByViews(displayedData);
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
            <td>
                <div class="title-artist">
                    <span class="song-title">${song.Title || 'Not Available'}</span><br>
                    <span class="song-artist">${song.Artist || 'Not Available'}</span>
                </div>
            </td>
            <td>${song.Album || 'Not Available'}</td>
            <td>${formatViews(song.Views) || 'Not Available'}</td>
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
	document.getElementById('topImage').src = song.CoverImage || 'images/flamingo_logo.webp';
	updateYouTubeLink(song.youtube_url);
}

function updateYouTubeLink(youtube_url) {
	const youtubeButton = document.getElementById('youtubeLink');
	youtubeButton.href = youtube_url || 'https://www.youtube.com';
}

function sortTableByViews(data) {
	data.sort((a, b) => (b.Views || 0) - (a.Views || 0));
}

function sortTableByColumn(columnIndex, data) {
	const sortKeys = ['#', 'Title', 'Album', 'Views', 'Duration', 'ReleaseDate', 'Genre'];
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = ['Views', 'Duration', 'ReleaseDate'].includes(sortKey);

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
	if (key === 'Views') return (a[key] || 0) - (b[key] || 0);
	return 0;
}

function convertDurationToSeconds(duration) {
	const [minutes, seconds] = duration.split(':').map(Number);
	return minutes * 60 + seconds;
}

function getLimitedData(data, limit) {
	return data.slice(0, limit);
}

function formatViews(number) {
	if (!number) return 'Not Available';
	if (number >= 1e9) return (number / 1e9).toFixed(2) + ' B';
	if (number >= 1e6) return (number / 1e6).toFixed(1) + ' M';
	return number.toLocaleString();
}
