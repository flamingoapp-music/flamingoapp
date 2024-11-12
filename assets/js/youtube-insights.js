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

	setUpEventListeners();
});

function getPageType() {
	const path = window.location.pathname;
	if (path.includes('youtubeInsights.html')) {
		return 'insights';
	}
	return 'unknown';
}

function loadData(countryCode) {
	const dataFolder = 'insights';
	const arFile = `DATABASES/YOUTUBE/${dataFolder}/YT_${countryCode}.json`;
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
			sortTableByPosition(currentData);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(arData, tsData, ufData) {
	return arData.map(entry => {
		const tsEntry = tsData.find(ts => ts.SongID === entry.SongID) || {};
		const ufEntry = ufData.find(uf => uf.SongID === entry.SongID) || {};
		return { ...entry, ...tsEntry, ...ufEntry };
	});
}

function setUpEventListeners() {
	const searchInput = document.getElementById('searchInput');
	const homeButton = document.getElementById('homeButton');

	if (searchInput) {
		searchInput.addEventListener('input', performSearch);
	}

	if (homeButton) {
		homeButton.addEventListener('click', resetTableToInitialState);
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
		if (category === 'title' && song.Title.toLowerCase().includes(searchText)) return true;
		if (category === 'artist' && song.Artist.toLowerCase().includes(searchText)) return true;
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
	document.getElementById('topImage').src = song.CoverImage || 'images/flamingo_logo.webp';
	updateYouTubeLink(song.youtube_url);
}

function updateYouTubeLink(youtube_url) {
	const youtubeButton = document.getElementById('youtubeLink');
	youtubeButton.href = youtube_url || 'https://www.youtube.com';
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
	const [minutes, seconds] = duration.split(':').map(Number);
	return minutes * 60 + seconds;
}

function getLimitedData(data, limit) {
	return data.slice(0, limit);
}

function populateCountryDropdown() {
	const countrySelect = document.getElementById('countrySelect');
	if (countrySelect) {
		Array.from(countrySelect.options).forEach(option => {
			if (option.value === 'us') option.selected = true;
		});
	}
}
