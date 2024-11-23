let currentData = [];
let initialData = [];
let displayedData = [];
let sortDirection = {};
let rowsToShow = 200;

document.addEventListener('DOMContentLoaded', function () {
	populateCountryDropdown();
	setUpEventListeners();
	loadData('global'); // Default to 'ww' for Global charts
});

function loadData(country) {
	const jsonFile = `DATABASES/OTHER_CHARTS/shazam_DATABASES/shazam_${country}.json`;
	const tsFile = `DATABASES/OTHER_CHARTS/shazam_DATABASES/TS.json`;
	const siFile = `DATABASES/OTHER_CHARTS/shazam_DATABASES/SI.json`;
	const spFile = `DATABASES/OTHER_CHARTS/shazam_DATABASES/SP.json`;

	Promise.all([
		fetch(jsonFile).then(response => response.json()),
		fetch(tsFile).then(response => response.json()),
		fetch(siFile).then(response => response.json()),
		fetch(spFile).then(response => response.json())
	])
		.then(([shazamDataCountry, tsData, siData, spData]) => {
			console.log('shazam Country Data:', shazamDataCountry);
			console.log('Technical Specs:', tsData);
			console.log('Song Information:', siData);
			console.log('Spotify URLs:', spData);
			currentData = mergeDataBySongID(shazamDataCountry, tsData, siData, spData);
			console.log('Merged Data:', currentData);
			initialData = [...currentData];
			sortTableByPosition(currentData);
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
		})
		.catch(error => console.error('Error loading JSON files:', error));
}

function mergeDataBySongID(shazamDataCountry, tsData, siData, spData) {
	const tsMap = Object.fromEntries(tsData.map(item => [item.SongID.toString(), item]));
	const siMap = Object.fromEntries(siData.map(item => [item.SongID.toString(), item]));
	const spMap = Object.fromEntries(spData.map(item => [item.SongID.toString(), item]));

	return shazamDataCountry.map(shazamEntry => {
		const songID = shazamEntry.SongID.toString();
		const tsEntry = tsMap[songID] || {};
		const siEntry = siMap[songID] || {};
		const spEntry = spMap[songID] || {};

		return {
			SongID: songID,
			Position: shazamEntry.Position,
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

	const displaySelect = document.getElementById('displayselect');
	if (displaySelect) {
		displaySelect.addEventListener('change', function () {
			rowsToShow = parseInt(displaySelect.value) || 200;
			displayedData = getLimitedData(currentData, rowsToShow);
			populateTable(displayedData);
		});
	}

	const searchButton = document.getElementById('searchButton');
	if (searchButton) {
		searchButton.addEventListener('click', performSearch);
	}

	const homeButton = document.getElementById('homeButton');
	if (homeButton) {
		homeButton.addEventListener('click', resetTableToInitialState);
	}

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
	const categoryElement = document.getElementById('searchCategory');
	const category = categoryElement ? categoryElement.value.toLowerCase() : 'title';
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
	const sortKeys = ['#', 'Position', 'Title', 'Artist', 'Album', 'Duration', 'ReleaseDate', 'Genre'];
	const sortKey = sortKeys[columnIndex];
	const isNumericSort = ['Position', 'Duration', 'ReleaseDate'].includes(sortKey);

	data.sort((a, b) => {
		let comparison;
		if (isNumericSort) {
			comparison = parseInt(a[sortKey]) - parseInt(b[sortKey]);
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

function convertDurationToSeconds(duration) {
	if (!duration) return 0;
	const [minutes, seconds] = duration.split(':').map(Number);
	return minutes * 60 + seconds;
}

function sortNumerically(a, b, key) {
	if (key === 'Duration') return convertDurationToSeconds(a[key]) - convertDurationToSeconds(b[key]);
	if (key === 'ReleaseDate') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
	if (key === 'Position') return parseInt(a[key] || 0) - parseInt(b[key] || 0);
	return 0;
}

function getLimitedData(data, limit) {
	return data.slice(0, limit);
}

function populateCountryDropdown() {
	const countrySelect = document.getElementById('countrySelect');
	if (countrySelect) {
		countrySelect.innerHTML = `
            <option value="Global" selected>🌍 Global</option>
            <!-- North America and Central America -->
            <optgroup label="North America and Central America">
\t\t\t\t\t\t\t\t\t<option value="us">🇺🇸 United States</option>
\t\t\t\t\t\t\t\t\t<option value="ca">🇨🇦 Canada</option>
\t\t\t\t\t\t\t\t\t<option value="mx">🇲🇽 Mexico</option>
\t\t\t\t\t\t\t\t\t<option value="cr">🇨🇷 Costa Rica</option>
\t\t\t\t\t\t\t\t</optgroup>

\t\t\t\t\t\t\t\t<!-- South America -->
\t\t\t\t\t\t\t\t<optgroup label="South America">
\t\t\t\t\t\t\t\t\t<option value="ar">🇦🇷 Argentina</option>
\t\t\t\t\t\t\t\t\t<option value="br">🇧🇷 Brazil</option>
\t\t\t\t\t\t\t\t\t<option value="cl">🇨🇱 Chile</option>
\t\t\t\t\t\t\t\t\t<option value="co">🇨🇴 Colombia</option>
\t\t\t\t\t\t\t\t\t<option value="ec">🇪🇨 Ecuador</option>
\t\t\t\t\t\t\t\t\t<option value="pe">🇵🇪 Peru</option>
\t\t\t\t\t\t\t\t\t<option value="uy">🇺🇾 Uruguay</option>
\t\t\t\t\t\t\t\t\t<option value="ve">🇻🇪 Venezuela</option>
\t\t\t\t\t\t\t\t</optgroup>

\t\t\t\t\t\t\t\t<!-- Europe -->
\t\t\t\t\t\t\t\t<optgroup label="Europe">
\t\t\t\t\t\t\t\t\t<option value="de">🇩🇪 Germany</option>
\t\t\t\t\t\t\t\t\t<option value="fr">🇫🇷 France</option>
\t\t\t\t\t\t\t\t\t<option value="it">🇮🇹 Italy</option>
\t\t\t\t\t\t\t\t\t<option value="es">🇪🇸 Spain</option>
\t\t\t\t\t\t\t\t\t<option value="pt">🇵🇹 Portugal</option>
\t\t\t\t\t\t\t\t\t<option value="be">🇧🇪 Belgium</option>
\t\t\t\t\t\t\t\t\t<option value="nl">🇳🇱 Netherlands</option>
\t\t\t\t\t\t\t\t\t<option value="pl">🇵🇱 Poland</option>
\t\t\t\t\t\t\t\t\t<option value="se">🇸🇪 Sweden</option>
\t\t\t\t\t\t\t\t\t<option value="no">🇳🇴 Norway</option>
\t\t\t\t\t\t\t\t\t<option value="fi">🇫🇮 Finland</option>
\t\t\t\t\t\t\t\t\t<option value="ch">🇨🇭 Switzerland</option>
\t\t\t\t\t\t\t\t\t<option value="at">🇦🇹 Austria</option>
\t\t\t\t\t\t\t\t\t<option value="ie">🇮🇪 Ireland</option>
\t\t\t\t\t\t\t\t</optgroup>

\t\t\t\t\t\t\t\t<!-- Asia -->
\t\t\t\t\t\t\t\t<optgroup label="Asia">
\t\t\t\t\t\t\t\t\t<option value="cn">🇨🇳 China</option>
\t\t\t\t\t\t\t\t\t<option value="jp">🇯🇵 Japan</option>
\t\t\t\t\t\t\t\t\t<option value="in">🇮🇳 India</option>
\t\t\t\t\t\t\t\t\t<option value="kr">🇰🇷 South Korea</option>
\t\t\t\t\t\t\t\t\t<option value="tw">🇹🇼 Taiwan</option>
\t\t\t\t\t\t\t\t\t<option value="sg">🇸🇬 Singapore</option>
\t\t\t\t\t\t\t\t\t<option value="my">🇲🇾 Malaysia</option>
\t\t\t\t\t\t\t\t\t<option value="th">🇹🇭 Thailand</option>
\t\t\t\t\t\t\t\t\t<option value="vn">🇻🇳 Vietnam</option>
\t\t\t\t\t\t\t\t\t<option value="ph">🇵🇭 Philippines</option>
\t\t\t\t\t\t\t\t\t<option value="id">🇮🇩 Indonesia</option>
\t\t\t\t\t\t\t\t</optgroup>

\t\t\t\t\t\t\t\t<!-- Africa -->
\t\t\t\t\t\t\t\t<optgroup label="Africa">
\t\t\t\t\t\t\t\t\t<option value="za">🇿🇦 South Africa</option>
\t\t\t\t\t\t\t\t\t<option value="ng">🇳🇬 Nigeria</option>
\t\t\t\t\t\t\t\t\t<option value="eg">🇪🇬 Egypt</option>
\t\t\t\t\t\t\t\t\t<option value="ke">🇰🇪 Kenya</option>
\t\t\t\t\t\t\t\t\t<option value="gh">🇬🇭 Ghana</option>
\t\t\t\t\t\t\t\t</optgroup>

\t\t\t\t\t\t\t\t<!-- Oceania -->
\t\t\t\t\t\t\t\t<optgroup label="Oceania">
\t\t\t\t\t\t\t\t\t<option value="au">🇦🇺 Australia</option>
\t\t\t\t\t\t\t\t\t<option value="nz">🇳🇿 New Zealand</option>
\t\t\t\t\t\t\t\t</optgroup>
        `;
	}
}
