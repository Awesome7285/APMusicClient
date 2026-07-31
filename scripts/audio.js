const playPauseButton = document.getElementById('play-pause');
const audio = document.getElementById('audio');
const progressBarContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');

// Play/Pause Toggle
playPauseButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseButton.textContent = '⏸'; // Pause symbol
    } else {
        audio.pause();
        playPauseButton.textContent = '▶'; // Play symbol
    }
});

// Register media session controls
if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => {
        audio.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
        audio.pause();
    });
}

// Update Progress Bar
audio.addEventListener('timeupdate', () => {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
});

// Seek Audio
progressBarContainer.addEventListener('click', (e) => {
    const containerWidth = progressBarContainer.offsetWidth;
    const clickPosition = e.offsetX;
    const clickPercent = clickPosition / containerWidth;
    audio.currentTime = clickPercent * audio.duration;
});

// Volume Slider
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});


// Initialize some shit
var song_index = 0;
var currentSong = null;
var queue = [];


function nextInQueue() {
    if (queue.length != 0) {
        song_index = queue.shift();

        // Remove From Queue
        const queue_text = document.getElementById("queue-text");
        queue_text.removeChild(queue_text.children[0]);
        update_track_info(locations[song_index])
    }
}

function update_track_info(song) {
    if (song === null) {
        return;
    }
    const audio = document.getElementById('audio');
    const trackInfoGame = document.getElementById('info-text-game');
    const trackInfoEN = document.getElementById('info-text');
    const trackInfoJP = document.getElementById('info-text-bottom');
    // const trackInfoComposer = document.getElementById('info-text-composer');
    const requirements = document.getElementById('requirement-images');

    get_track_directory(song).then(songDir => {
        audio.src = songDir ?? locations[song_index]["url"];
        audio.volume = volumeSlider.value;
        audio.autoplay = true;
        console.log("Playing audio", audio.src)
    });
    
    trackInfoGame.textContent = `${song['region']}`;
    trackInfoEN.textContent = `${location_to_track_name(song['name'])}`;
    trackInfoJP.textContent = `${song['original_name']}`;
    if (trackInfoJP.textContent === "undefined") {
        document.getElementById("info-text-bottom").style = "visibility: hidden;"
    } else {
        document.getElementById("info-text-bottom").style = "visibility: visible;"
    }
    // trackInfoComposer.textContent = `${song['composer']}`;

    // Show the current song's requirements
    requirements.innerHTML = "";
    let requirementsDict = locationGetRequirements(song['name']);
    let bad = {}; let bad2 = `${song['region']}`; bad[bad2] = 1;
    requirementsDict = {...bad, ...requirementsDict}
    console.log(requirementsDict)
    const requirements_container = addRequirementImages(requirementsDict);
    requirements.appendChild(requirements_container);

    currentSong = song;
}

async function get_track_directory(song) {
    let filename = song['original_name'] ?? song['name']
    filename = filename.replace(/[<>:"\/\\|?*]+/g, "");
    const region = song.region.replace(/[<>:"\/\\|?*]+/g, "");

    const basePath = `./audio/${ap_game}/${region}/${filename}`;

    // If the location name includes the filename (ogg) then just return
    if (filename.toLowerCase().endsWith(".ogg")) {
        return basePath;
    }

    const extensions = [".mp3", ".wav", ".flac", ".m4a", ".aac"];

    // Check which one actually exists
    for (const ext of extensions) {
        const testPath = basePath.endsWith(ext) ? basePath : basePath + ext;
        const exists = await fileExists(testPath);
        if (exists) return testPath;
    }

    return null;
}

// helper function for browsers
async function fileExists(url) {
    try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
    } catch {
        return false;
    }
}

audio.addEventListener("ended", (event) => {
    sendLocation();
    if (document.getElementById("loop-song-toggle").checked === true) {
        audio.currentTime = 0;
        audio.autoplay = true;
        audio.play();
    } else {
        nextInQueue();
    }
})