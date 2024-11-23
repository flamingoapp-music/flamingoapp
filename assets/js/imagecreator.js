document.addEventListener("DOMContentLoaded", function () {
	const tsFile = "DATABASES/SPOTIFY/daily/TS.json";
	let mergedData = [];
	let currentIndex = 0; // Keep track of the current song index

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
	countryNameElement.textContent = `TOP SPOTIFY ${countryOptions[countryCode].toUpperCase()} CHARTS`;

	// Load data from SP_(countrycode).json and TS.json
	Promise.all([
		fetch(spFile).then((res) => res.json()),
		fetch(tsFile).then((res) => res.json())
	])
		.then(([spData, tsData]) => {
			// Merge data and sort by Position
			mergedData = mergeData(spData, tsData).sort((a, b) => a.Position - b.Position);
			if (mergedData.length > 0) {
				currentIndex = 0; // Start with the first song
				updateUI(mergedData[currentIndex]);
			} else {
				console.error("No data found");
			}
		})
		.catch((error) => console.error("Error fetching data:", error));

	// Listen for keyboard events to navigate through songs
	document.addEventListener("keydown", (event) => {
		if (!mergedData.length) return;

		if (event.key === "ArrowRight") {
			// Go to the next song
			currentIndex = (currentIndex + 1) % mergedData.length; // Loop to the beginning
			updateUI(mergedData[currentIndex]);
		} else if (event.key === "ArrowLeft") {
			// Go to the previous song
			currentIndex = (currentIndex - 1 + mergedData.length) % mergedData.length; // Loop to the end
			updateUI(mergedData[currentIndex]);
		}
	});
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

// Update the UI with song data
function updateUI(song) {
	// Update the title and artist
	document.getElementById("topTitle").textContent = `${song.Position}: ${song.Title}`;
	document.getElementById("topArtist").textContent = song.Artist;

	// Update the cover image
	const coverImage = document.getElementById("topImage");
	coverImage.src = song.CoverImage || "images/flamingo%20logo.webp"; // Fallback image
	coverImage.alt = `${song.Title} Cover Image`;
}