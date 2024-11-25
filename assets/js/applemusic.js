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
           <option value="global" selected>🌍 Global</option>

<!-- North America and Central America -->
<optgroup label="North America and Central America">
    <option value="us">🇺🇸 United States</option>
    <option value="ca">🇨🇦 Canada</option>
    <option value="mx">🇲🇽 Mexico</option>
    <option value="gt">🇬🇹 Guatemala</option>
    <option value="hn">🇭🇳 Honduras</option>
    <option value="ni">🇳🇮 Nicaragua</option>
    <option value="pa">🇵🇦 Panama</option>
    <option value="bz">🇧🇿 Belize</option>
    <option value="cr">🇨🇷 Costa Rica</option>
    <option value="sv">🇸🇻 El Salvador</option>
</optgroup>

<!-- South America -->
<optgroup label="South America">
    <option value="ar">🇦🇷 Argentina</option>
    <option value="bo">🇧🇴 Bolivia</option>
    <option value="br">🇧🇷 Brazil</option>
    <option value="cl">🇨🇱 Chile</option>
    <option value="co">🇨🇴 Colombia</option>
    <option value="ec">🇪🇨 Ecuador</option>
    <option value="gy">🇬🇾 Guyana</option>
    <option value="pe">🇵🇪 Peru</option>
    <option value="py">🇵🇾 Paraguay</option>
    <option value="sr">🇸🇷 Suriname</option>
    <option value="uy">🇺🇾 Uruguay</option>
    <option value="ve">🇻🇪 Venezuela</option>
</optgroup>

<!-- Europe -->
<optgroup label="Europe">
    <option value="al">🇦🇱 Albania</option>
    <option value="at">🇦🇹 Austria</option>
    <option value="be">🇧🇪 Belgium</option>
    <option value="bg">🇧🇬 Bulgaria</option>
    <option value="ch">🇨🇭 Switzerland</option>
    <option value="cz">🇨🇿 Czech Republic</option>
    <option value="de">🇩🇪 Germany</option>
    <option value="dk">🇩🇰 Denmark</option>
    <option value="ee">🇪🇪 Estonia</option>
    <option value="es">🇪🇸 Spain</option>
    <option value="fi">🇫🇮 Finland</option>
    <option value="fr">🇫🇷 France</option>
    <option value="gb">🇬🇧 United Kingdom</option>
    <option value="gr">🇬🇷 Greece</option>
    <option value="hr">🇭🇷 Croatia</option>
    <option value="hu">🇭🇺 Hungary</option>
    <option value="ie">🇮🇪 Ireland</option>
    <option value="it">🇮🇹 Italy</option>
    <option value="lt">🇱🇹 Lithuania</option>
    <option value="lu">🇱🇺 Luxembourg</option>
    <option value="lv">🇱🇻 Latvia</option>
    <option value="nl">🇳🇱 Netherlands</option>
    <option value="pl">🇵🇱 Poland</option>
    <option value="pt">🇵🇹 Portugal</option>
    <option value="ro">🇷🇴 Romania</option>
    <option value="rs">🇷🇸 Serbia</option>
    <option value="se">🇸🇪 Sweden</option>
    <option value="si">🇸🇮 Slovenia</option>
    <option value="sk">🇸🇰 Slovakia</option>
</optgroup>

<!-- Asia -->
<optgroup label="Asia">
    <option value="ae">🇦🇪 United Arab Emirates</option>
    <option value="am">🇦🇲 Armenia</option>
    <option value="az">🇦🇿 Azerbaijan</option>
    <option value="bh">🇧🇭 Bahrain</option>
    <option value="bd">🇧🇩 Bangladesh</option>
    <option value="bt">🇧🇹 Bhutan</option>
    <option value="cn">🇨🇳 China</option>
    <option value="ge">🇬🇪 Georgia</option>
    <option value="id">🇮🇩 Indonesia</option>
    <option value="il">🇮🇱 Israel</option>
    <option value="in">🇮🇳 India</option>
    <option value="jp">🇯🇵 Japan</option>
    <option value="kh">🇰🇭 Cambodia</option>
    <option value="kr">🇰🇷 South Korea</option>
    <option value="kw">🇰🇼 Kuwait</option>
    <option value="lb">🇱🇧 Lebanon</option>
    <option value="lk">🇱🇰 Sri Lanka</option>
    <option value="mn">🇲🇳 Mongolia</option>
    <option value="my">🇲🇾 Malaysia</option>
    <option value="np">🇳🇵 Nepal</option>
    <option value="om">🇴🇲 Oman</option>
    <option value="ph">🇵🇭 Philippines</option>
    <option value="qa">🇶🇦 Qatar</option>
    <option value="sa">🇸🇦 Saudi Arabia</option>
    <option value="sg">🇸🇬 Singapore</option>
    <option value="th">🇹🇭 Thailand</option>
    <option value="tr">🇹🇷 Turkey</option>
    <option value="tw">🇹🇼 Taiwan</option>
    <option value="uz">🇺🇿 Uzbekistan</option>
    <option value="vn">🇻🇳 Vietnam</option>
</optgroup>

<!-- Africa -->
<optgroup label="Africa">
    <option value="dz">🇩🇿 Algeria</option>
    <option value="eg">🇪🇬 Egypt</option>
    <option value="gh">🇬🇭 Ghana</option>
    <option value="ke">🇰🇪 Kenya</option>
    <option value="ma">🇲🇦 Morocco</option>
    <option value="ng">🇳🇬 Nigeria</option>
    <option value="za">🇿🇦 South Africa</option>
</optgroup>

<!-- Oceania -->
<optgroup label="Oceania">
    <option value="au">🇦🇺 Australia</option>
    <option value="fj">🇫🇯 Fiji</option>
    <option value="nz">🇳🇿 New Zealand</option>
</optgroup>

        `;
	}
}
