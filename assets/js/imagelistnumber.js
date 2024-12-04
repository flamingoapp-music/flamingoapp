document.addEventListener("DOMContentLoaded", function () {
	// Set the date in format "DD - Month(in words) of YYYY"
	const dateElement = document.getElementById("headerDate");
	const currentDate = new Date();
	const day = currentDate.getDate();
	const monthNames = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	const month = monthNames[currentDate.getMonth()];
	const year = currentDate.getFullYear();
	const formattedDate = `Week from ${day} of ${month} of ${year}`;
	dateElement.textContent = formattedDate;

	const platformOptions = {
		spotifyDaily: "DATABASES/SPOTIFY/daily/SP_",
		spotifyWeekly: "DATABASES/SPOTIFY/weekly/SP_",
		appleMusic: "DATABASES/APPLE_MUSIC/apple_music_",
		youtubeInsights: "DATABASES/YOUTUBE/insights/YT_",
		deezerCharts: "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/deezer_",
		shazamCharts: "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/shazam_",
		itunesCharts: "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/itunes_"
	};

	const siTsFiles = {
		spotifyDaily: { si: "DATABASES/SPOTIFY/daily/SI.json", ts: "DATABASES/SPOTIFY/daily/TS.json" },
		spotifyWeekly: { si: "DATABASES/SPOTIFY/weekly/SI.json", ts: "DATABASES/SPOTIFY/weekly/TS.json" },
		appleMusic: { si: "DATABASES/APPLE_MUSIC/SI.json", ts: "DATABASES/APPLE_MUSIC/TS.json" },
		youtubeInsights: { si: "DATABASES/YOUTUBE/insights/SI.json", ts: "DATABASES/YOUTUBE/insights/TS.json" },
		deezerCharts: { si: "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/SI.json", ts: "DATABASES/OTHER_CHARTS/DEEZER_DATABASES/TS.json" },
		shazamCharts: { si: "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/SI.json", ts: "DATABASES/OTHER_CHARTS/SHAZAM_DATABASES/TS.json" },
		itunesCharts: { si: "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/SI.json", ts: "DATABASES/OTHER_CHARTS/ITUNES_DATABASES/TS.json" }
	};

	const countryOptions = {
		us: "United States", gb: "England", ca: "Canada", mx: "Mexico", bz: "Belize", cr: "Costa Rica",
		sv: "El Salvador", gt: "Guatemala", hn: "Honduras", ni: "Nicaragua", pa: "Panama",
		do: "Dominican Republic", ar: "Argentina", bo: "Bolivia", br: "Brazil", cl: "Chile",
		co: "Colombia", ec: "Ecuador", py: "Paraguay", pe: "Peru", uy: "Uruguay", ve: "Venezuela",
		de: "Germany", fr: "France", it: "Italy", es: "Spain", pt: "Portugal", be: "Belgium",
		nl: "Netherlands", pl: "Poland", se: "Sweden", no: "Norway", fi: "Finland", ch: "Switzerland",
		at: "Austria", ie: "Ireland", kr: "Korea", jp: "Japan", in: "India", sg: "Singapore",
		my: "Malaysia", th: "Thailand", ph: "Philippines", hk: "Hong Kong", id: "Indonesia",
		za: "South Africa", ng: "Nigeria", eg: "Egypt", ke: "Kenya", gh: "Ghana", au: "Australia",
		nz: "New Zealand", Global: "Global"
	};

	const platformLogos = {
		spotifyDaily: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
		spotifyWeekly: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
		appleMusic: 'https://www.citypng.com/public/uploads/preview/hd-apple-itunes-music-round-white-icon-transparent-background-701751694974721aets5ghsqq.png',
		youtubeInsights: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
		deezerCharts: 'https://brandlogo.org/wp-content/uploads/2024/05/Deezer-Logo-Icon-300x300.png.webp',
		shazamCharts: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shazam_icon.svg/2048px-Shazam_icon.svg.png',
		itunesCharts: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png'
	};

	function getCountryIcon(countryCode) {
		if (countryCode === "Global") return null;
		return `https://flagcdn.com/w40/${countryCode}.png`;
	}

	function promptForPlatform() {
		let userInput = prompt("Select a platform:\n1. Spotify Daily\n2. Spotify Weekly\n3. Apple Music Charts\n4. Youtube Insights\n5. Deezer Charts\n6. Shazam Charts\n7. iTunes Charts");
		switch (userInput.trim()) {
			case "1": return "spotifyDaily";
			case "2": return "spotifyWeekly";
			case "3": return "appleMusic";
			case "4": return "youtubeInsights";
			case "5": return "deezerCharts";
			case "6": return "shazamCharts";
			case "7": return "itunesCharts";
			default: return promptForPlatform();
		}
	}

	function promptForCountry() {
		let userInput = prompt("Enter a country name or code (e.g., 'United States' or 'us'):");
		if (!userInput) return promptForCountry();
		userInput = userInput.trim().toLowerCase();
		const countryCode = Object.keys(countryOptions).find(
			(code) => code === userInput || countryOptions[code].toLowerCase() === userInput
		);
		return countryCode || promptForCountry();
	}

	const selectedPlatform = promptForPlatform();
	const countryCode = promptForCountry();
	const dataFile = `${platformOptions[selectedPlatform]}${countryCode}.json`;
	const siFile = siTsFiles[selectedPlatform].si;
	const tsFile = siTsFiles[selectedPlatform].ts;

	const platformNameMap = {
		spotifyDaily: "Spotify Daily",
		spotifyWeekly: "Spotify Weekly",
		appleMusic: "Apple Music Charts",
		youtubeInsights: "Youtube Insights",
		deezerCharts: "Deezer Charts",
		shazamCharts: "Shazam Charts",
		itunesCharts: "iTunes Charts"
	};

	const countryNameElement = document.getElementById("countryName");
	const countryIcon = document.getElementById("countryIcon");
	const platformLogo = document.getElementById("platformLogo");
	const topImage = document.getElementById("topImage");

	countryNameElement.textContent = `${platformNameMap[selectedPlatform].toUpperCase()} ${countryOptions[countryCode].toUpperCase()}`;
	platformLogo.src = platformLogos[selectedPlatform];
	platformLogo.alt = `${platformNameMap[selectedPlatform]} Logo`;

	if (selectedPlatform === "youtubeInsights") {
		platformLogo.classList.add("youtube-logo");
	}

	if (countryCode === "Global") {
		countryIcon.style.display = "none";
	} else {
		countryIcon.src = getCountryIcon(countryCode);
		countryIcon.alt = countryOptions[countryCode];
		countryIcon.style.display = "inline";
	}

	Promise.all([
		fetch(dataFile).then((res) => res.json()),
		fetch(siFile).then((res) => res.json()),
		fetch(tsFile).then((res) => res.json())
	])
		.then(([data, siData, tsData]) => {
			const mergedData = mergeData(data, siData, tsData).sort((a, b) => a.Position - b.Position);
			updateTopImage(mergedData[0]);
			updateSongListUI(mergedData.slice(0, 10)); // Display positions 2-10
		})
		.catch((error) => console.error("Error fetching data:", error));

	function mergeData(data, siData, tsData) {
		const siMap = {};
		const tsMap = {};
		siData.forEach(item => siMap[item.SongID] = item);
		tsData.forEach(item => tsMap[item.SongID] = item);
		return data.map(entry => {
			const songID = entry.SongID;
			const siEntry = siMap[songID] || {};
			const tsEntry = tsMap[songID] || {};
			return {
				SongID: songID,
				Position: entry.Position,
				Title: siEntry.Title || "Unknown Title",
				Artist: siEntry.Artist || "Unknown Artist",
				CoverImage: tsEntry.CoverImage || "images/default_cover.jpg",
			};
		});
	}

	function updateTopImage(song) {
		topImage.src = song.CoverImage;
		topImage.alt = `${song.Title} Cover`;
	}

	function updateSongListUI(songs) {
		const songList = document.getElementById("songList");
		songList.innerHTML = '';

		const firstColumnSongs = songs.slice(0, 5);
		const secondColumnSongs = songs.slice(5, 10);

		const columnsContainer = document.createElement('div');
		columnsContainer.className = 'columns-container';

		const firstColumn = document.createElement('div');
		firstColumn.className = 'column';
		const firstList = document.createElement('ul');
		firstList.className = 'song-list';
		firstColumnSongs.forEach(song => {
			const listItem = createSongListItem(song);
			firstList.appendChild(listItem);
		});
		firstColumn.appendChild(firstList);

		const secondColumn = document.createElement('div');
		secondColumn.className = 'column';
		const secondList = document.createElement('ul');
		secondList.className = 'song-list';
		secondColumnSongs.forEach(song => {
			const listItem = createSongListItem(song);
			secondList.appendChild(listItem);
		});
		secondColumn.appendChild(secondList);

		columnsContainer.appendChild(firstColumn);
		columnsContainer.appendChild(secondColumn);

		songList.appendChild(columnsContainer);
	}

	function createSongListItem(song) {
		const listItem = document.createElement("li");

		const img = document.createElement("img");
		img.src = song.CoverImage;
		img.alt = `${song.Title} Cover`;

		const songInfo = document.createElement("div");
		songInfo.className = "song-info-list";

		const title = document.createElement("span");
		title.className = "song-title";
		title.textContent = `${song.Position}. ${song.Title}`;

		const artist = document.createElement("span");
		artist.className = "song-artist";
		artist.textContent = song.Artist;

		songInfo.appendChild(title);
		songInfo.appendChild(document.createElement("br"));
		songInfo.appendChild(artist);

		listItem.appendChild(img);
		listItem.appendChild(songInfo);

		return listItem;
	}
});
