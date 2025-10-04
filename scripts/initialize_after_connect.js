function doConnect() {
    // Load JSON immediately before anything else runs
    locations = load_json_sync(`./../data/${ap_game}/locations.json`);
    regions = load_json_sync(`./../data/${ap_game}/regions.json`);
    var meta = load_json_sync(`./../data/${ap_game}/info.json`);

    // Don't add shit above here

    song_index = 0;
    currentSong = null;
    queue = [];

    // Find the victory
    locations.forEach(location => {
        if (location["victory"]) {
            victory = location;
            locations.splice(location, 1);
            return;
        }
    });

    // Meta
    colon_names = meta["colon_names"];
    album_type_name = meta["album_type_name"];
    use_alt_names = meta["use_alt_names"];

    if (use_alt_names) {
        document.getElementById("info-text-bottom").style = "visibility: visible;"
    } else {
        document.getElementById("info-text-bottom").style = "visibility: hidden;"
    }

    // Debug: Check all audio files exist in the folder and are named correctly
    //checkSongsExist()
}

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

function checkSongsExist() {
    for (var i = 0; i < locations.length; i++) {
        song = locations[i]
        if (!UrlExists(get_track_directory(song))) {
            console.log(song['original_name'] ?? song['name'])
        }
    }
}