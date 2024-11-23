document.addEventListener("DOMContentLoaded", function () {
	const tsFile = "DATABASES/SPOTIFY/daily/TS.json";
	let mergedData = [];

	// List of valid countries with their codes
	const countryOptions = {
		us: "United States",
		gb: "England",
		ca: "Canada",
		mx: "Mexico",
		bz: "Belize",
		cr: "Costa Rica",
		sv: "El Salvador",
		gt: "Guatemala",
		hn: "Honduras",
		ni: "Nicaragua",
		pa: "Panama",
		do: "Dominican Republic",
		ar: "Argentina",
		bo: "Bolivia",
		br: "Brazil",
		cl: "Chile",
		co: "Colombia",
		ec: "Ecuador",
		py: "Paraguay",
		pe: "Peru",
		uy: "Uruguay",
		ve: "Venezuela",
		de: "Germany",
		fr: "France",
		it: "Italy",
		es: "Spain",
		pt: "Portugal",
		be: "Belgium",
		nl: "Netherlands",
		pl: "Poland",
		se: "Sweden",
		no: "Norway",
		fi: "Finland",
		ch: "Switzerland",
		at: "Austria",
		ie: "Ireland",
		kr: "Korea",
		jp: "Japan",
		in: "India",
		sg: "Singapore",
		my: "Malaysia",
		th: "Thailand",
		ph: "Philippines",
		hk: "Hong Kong",
		id: "Indonesia",
		za: "South Africa",
		ng: "Nigeria",
		eg: "Egypt",
		ke: "Kenya",
		gh: "Ghana",
		au: "Australia",
		nz: "New Zealand",
		Global: "Global"
	};

	// Ask the user to choose a country
	function promptForCountry() {
		let userInput = prompt(
			"Please enter a country name or code (e.g., 'United States' or 'us'):"
		);
		if (!userInput) return promptForCountry(); // Ask again if input is empty

		userInput = userInput.trim().toLowerCase();
		// Find country by code or name
		const countryCode = Object.keys(countryOptions).find(
			(code) => code === userInput || countryOptions[code].toLowerCase() === userInput
		);

		if (countryCode) {
			return countryCode;
		} else {
			alert("Invalid country name or code. Please try again.");
			return promptForCountry();
		}
	}

	// Get the country code
	const countryCode = promptForCountry();
	const spFile = `DATABASES/SPOTIFY/daily/SP_${countryCode}.json`;

	// Update the country name in the title
	const countryNameElement = document.getElementById("countryName");
	if (countryNameElement) {
		countryNameElement.textContent = `TOP SPOTIFY ${countryOptions[countryCode].toUpperCase()} CHARTS`;
	}

	// Load data from SP_(countrycode).json and TS.json
	Promise.all([
		fetch(spFile).then((res) => res.json()),
		fetch(tsFile).then((res) => res.json())
	])
		.then(([spData, tsData]) => {
			// Merge data and sort by Position
			mergedData = mergeData(spData, tsData).sort((a, b) => a.Position - b.Position);

			// Update the UI
			if (mergedData.length > 0) {
				updateSongListUI(mergedData.slice(1, 10)); // Show ranks 2nd to 10th
			}
		})
		.catch((error) => console.error("Error fetching data:", error));
});

// Merge SP and TS data by SongID
function mergeData(spData, tsData) {
	return spData.map((spEntry) => {
		const tsEntry = tsData.find((ts) => ts.SongID === spEntry.SongID) || {};
		return {
			...spEntry,
			...tsEntry
		};
	});
}

// Update the UI for the song list (ranks 2nd to 10th)
function updateSongListUI(songs) {
	const songList = document.getElementById("songList");
	songs.forEach((song, index) => {
		const listItem = document.createElement("li");

		// Rank
		const rank = document.createElement("div");
		rank.className = "song-rank";
		rank.textContent = `${index + 2}.`;

		// Image
		const img = document.createElement("img");
		img.src = song.CoverImage || "images/default_cover.jpg";
		img.alt = `${song.Title} Cover`;

		// Song Info
		const songInfo = document.createElement("div");
		songInfo.className = "song-info-list";

		const title = document.createElement("span"); // Changed from <p> to <span> for inline display
		title.className = "song-title";
		title.textContent = song.Title;

		const artist = document.createElement("span"); // Changed from <p> to <span> for inline display
		artist.className = "song-artist";
		artist.textContent = song.Artist;

		// Append elements
		songInfo.appendChild(title);
		songInfo.appendChild(artist);
		listItem.appendChild(rank);
		listItem.appendChild(img);
		listItem.appendChild(songInfo);
		songList.appendChild(listItem);
	});
}
