function doConnect() {
    // Load JSON immediately before anything else runs
    slot_data.enabled_groups.forEach(group => {
        locations.push(...load_json_sync(`./data/locations/${group}.json`));
    })

    // Re Add Regions
    regions = Object.fromEntries(
        slot_data.enabled_albums.map(r => [r, { requires: `|${r}|` }])
    );
    

    // Don't add shit above here

    song_index = 0;
    currentSong = null;
    queue = [];
    console.log(regions);

    // Meta
    colon_names = true;
    album_type_name = "Album";

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