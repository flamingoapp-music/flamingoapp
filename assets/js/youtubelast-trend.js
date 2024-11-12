let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};
let rowsToShow = 200;
let pageType = '';

document.addEventListener('DOMContentLoaded', function () {
	pageType = getPageType();

	if (pageType === 'trendings') {
		loadData();
	} else if (pageType === 'insights') {
		const countrySelect = document.getElementById('countrySelect');
		if (countrySelect) {
			populateCountryDropdown();
			loadData('us');
			countrySelect.addEventListener('change', function () {
				const selectedCountry = countrySelect.value;
				loadData(selectedCountry);
			});
		}
	} else if (pageType === 'top_songs' || pageType === 'latest') {
		loadData();
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
	if (path.includes('youtubeTopSongs.html')) {
		return 'top_songs';
	} else if (path.includes('youtubeInsights.html')) {
		return 'insights';
	} else if (path.includes('youtubeLatest.html')) {
		return 'latest';
	} else if (path.includes('youtubeTrendings.html')) {
		return 'trendings';
	} else {
		return 'unknown';
	}
}

function loadData(countryCode) {
	if (pageType === 'trendings') {
		const dataFile = 'DATABASES/YOUTUBE/youtube_trending.json';
		fetch(dataFile).then(response => response.json())
			.then(data => {
				currentData = data;
				initialData = [...currentData];
				sortTableByPosition(currentData);
				displayedData = getLimitedData(currentData, rowsToShow);
				populateTable(displayedData);
			})
			.catch(error => console.error('Error loading JSON file:', error));
	} else if (pageType === 'insights') {
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
	} else if (pageType === 'top_songs') {
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
	} else if (pageType === 'latest') {
		const dataFile = 'DATABASES/YOUTUBE/youtube_latest.json';
		fetch(dataFile).then(response => response.json())
			.then(data => {
				currentData = data;
				initialData = [...currentData];
				sortTableByPosition(currentData);
				displayedData = getLimitedData(currentData, rowsToShow);
				populateTable(displayedData);
			})
			.catch(error => console.error('Error loading JSON file:', error));
	}
}

function mergeDataBySongID(arData, tsData, ufData) {
	if (pageType === 'insights') {
		return arData.map(entry => {
			const tsEntry = tsData.find(ts => ts.SongID === entry.SongID) || {};
			const ufEntry = ufData.find(uf => uf.SongID === entry.SongID) || {};
			return { ...entry, ...tsEntry, ...ufEntry };
		});
	} else if (pageType === 'top_songs') {
		return tsData.map(tsEntry => {
			const arEntry = arData.find(ar => ar.SongID === tsEntry.SongID) || {};
			const ufEntry = ufData.find(uf => uf.SongID === tsEntry.SongID) || {};
			return { ...tsEntry, ...arEntry, ...ufEntry };
		});
	}
}

function setUpEventListeners() {
	const searchInput = document.getElementById('searchInput');
	const homeButton = document.getElementById('homeButton');
	const displaySelect = document.getElementById('displayselect');

	if (searchInput) {
		searchInput.addEventListener('input', performSearch);
	}

	if (homeButton) {
		homeButton.addEventListener('click', resetTableToInitialState);
	}

	if (displaySelect) {
		displaySelect.addEventListener('change', function () {
			rowsToShow = this.value === 'All' ? initialData.length : parseInt(this.value);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
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

function resetTableToInitialState() {
	currentData = [...initialData];

	if (pageType === 'insights' || pageType === 'latest' || pageType === 'trendings') {
		sortTableByPosition(currentData);
	} else if (pageType === 'top_songs') {
		sortTableByViews(currentData);
	}

	displayedData = getLimitedData(currentData, rowsToShow);
	populateTable(displayedData);
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		searchInput.value = '';
	}
}

function performSearch() {
	const categorySelect = document.getElementById('searchCategory');
	const searchInput = document.getElementById('searchInput');
	const category = categorySelect ? categorySelect.value.toLowerCase() : 'title';
	const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';

	displayedData = initialData.filter(song => {
		if (category === 'title' && song.Title.toLowerCase().includes(searchText)) return true;
		if (category === 'artist' && song.Artist && song.Artist.toLowerCase().includes(searchText)) return true;
		if (category === 'album' && song.Album && song.Album.toLowerCase().includes(searchText)) return true;
		if (category === 'genre' && song.Genre && song.Genre.toLowerCase().includes(searchText)) return true;
		return false;
	});

	if (pageType === 'insights' || pageType === 'latest' || pageType === 'trendings') {
		sortTableByPosition(displayedData);
	} else if (pageType === 'top_songs') {
		sortTableByViews(displayedData);
	}

	displayedData = getLimitedData(displayedData, rowsToShow);
	populateTable(displayedData);
}

function populateTable(data) {
	const tableBody = document.querySelector('.table tbody');
	tableBody.innerHTML = '';
	data.forEach((song, index) => {
		const row = document.createElement('tr');
		row.songData = song;
		let rowHTML = `<td>${index + 1}</td>`;

		if (pageType === 'insights') {
			rowHTML += `
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
		} else if (pageType === 'top_songs') {
			rowHTML += `
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
		} else if (pageType === 'latest' || pageType === 'trendings') {
			rowHTML += `
                <td>${song.Position || 'N/A'}</td>
                <td>${song.Title || 'Not Available'}</td>
            `;
		}
		row.innerHTML = rowHTML;
		row.addEventListener('click', () => {
			const youtube_url = song.youtube_url || song.YouTube_URL || song.Youtube_URL;
			if (youtube_url) {
				window.open(youtube_url, '_blank');
			}
		});
		tableBody.appendChild(row);
	});
}

function sortTableByViews(data) {
	data.sort((a, b) => b.Views - a.Views);
}

function sortTableByPosition(data) {
	data.sort((a, b) => parseInt(a.Position) - parseInt(b.Position));
}

function sortTableByColumn(columnIndex, data) {
	let sortKeys;
	if (pageType === 'insights') {
		sortKeys = ['#', 'Position', 'Title', 'Album', 'Duration', 'ReleaseDate', 'Genre'];
	} else if (pageType === 'top_songs') {
		sortKeys = ['#', 'Title', 'Album', 'Views', 'Duration', 'ReleaseDate', 'Genre'];
	} else if (pageType === 'latest' || pageType === 'trendings') {
		sortKeys = ['#', 'Position', 'Title'];
	}
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = ['Position', 'Views', 'Duration', 'ReleaseDate'].includes(sortKey);

	data.sort((a, b) => {
		let comparison = 0;
		if (isNumericSort) {
			comparison = sortNumerically(a, b, sortKey);
		} else {
			comparison = (a[sortKey] || '').localeCompare(b[sortKey] || '');
		}
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
	if (key === 'Position') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
	return 0;
}

function convertDurationToSeconds(duration) {
	if (!duration) return 0;
	const parts = duration.split(':').map(Number);
	if (parts.length === 3) {
		return parts[0] * 3600 + parts[1] * 60 + parts[2];
	} else if (parts.length === 2) {
		return parts[0] * 60 + parts[1];
	} else {
		return parts[0];
	}
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

function populateCountryDropdown() {
	const countrySelect = document.getElementById('countrySelect');
	if (countrySelect) {
		Array.from(countrySelect.options).forEach(option => {
			if (option.value === 'us') {
				option.selected = true;
			}
		});
	}
}
