const playPauseButton = document.getElementById('play-pause');
const audio = document.getElementById('audio');
const progressBarContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

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

    songDir = get_track_directory(song);

    trackInfoGame.textContent = `${song['region']}`;
    trackInfoEN.textContent = `${location_to_track_name(song['name'])}`;
    trackInfoJP.textContent = `${song['original_name']}`;
    // trackInfoComposer.textContent = `${song['composer']}`;

    audio.src = songDir;
    audio.autoplay = true;
}

function get_track_directory(song) {
    filename = song['original_name'] ?? song['name']
    filename = filename.replace(/[<>:"\/\\|?*]+/g, "");
    if (!filename.endsWith(".ogg")) {
        filename += ".mp3"
    }
    return `./../audio/${ap_game}/${song['region'].replace(/[<>:"\/\\|?*]+/g, "")}/${filename}`;
}

audio.addEventListener("ended", (event) => {
    sendLocation();
    nextInQueue();
})