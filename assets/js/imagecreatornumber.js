document.addEventListener("DOMContentLoaded", function () {
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

	function promptForPosition() {
		let userInput = prompt("Enter a position number:");
		return parseInt(userInput.trim(), 10) || promptForPosition();
	}

	const selectedPlatform = promptForPlatform();
	const countryCode = promptForCountry();
	let currentPosition = promptForPosition();
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

	countryNameElement.textContent = `${platformNameMap[selectedPlatform].toUpperCase()} ${countryOptions[countryCode].toUpperCase()}`;
	platformLogo.src = platformLogos[selectedPlatform];
	platformLogo.alt = `${platformNameMap[selectedPlatform]} Logo`;

	if (countryCode === "Global") {
		countryIcon.style.display = "none";
	} else {
		countryIcon.src = getCountryIcon(countryCode);
		countryIcon.alt = countryOptions[countryCode];
		countryIcon.style.display = "inline";
	}

	let mergedData = [];

	Promise.all([
		fetch(dataFile).then((res) => res.json()),
		fetch(siFile).then((res) => res.json()),
		fetch(tsFile).then((res) => res.json())
	])
		.then(([data, siData, tsData]) => {
			mergedData = mergeData(data, siData, tsData).sort((a, b) => a.Position - b.Position);
			const song = mergedData.find(item => item.Position === currentPosition);
			if (song) {
				updateUI(song);
			} else {
				console.error("Position not found in data");
			}
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

	function updateUI(song) {
		document.getElementById("topTitle").textContent = `${song.Position}: ${song.Title || "Unknown Title"}`;
		document.getElementById("topArtist").textContent = song.Artist || "Unknown Artist";
		const coverImage = document.getElementById("topImage");
		coverImage.src = song.CoverImage || "images/default_cover.jpg";
		coverImage.alt = `${song.Title || "Unknown Title"} Cover Image`;
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowRight" && mergedData.length > 0) {
			currentPosition = (currentPosition % mergedData.length) + 1;
			const song = mergedData.find(item => item.Position === currentPosition);
			if (song) updateUI(song);
		} else if (event.key === "ArrowLeft" && mergedData.length > 0) {
			currentPosition = (currentPosition - 2 + mergedData.length) % mergedData.length + 1;
			const song = mergedData.find(item => item.Position === currentPosition);
			if (song) updateUI(song);
		}
	});
});
