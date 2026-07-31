function doConnect() {
    // Load JSON immediately before anything else runs
    slot_data.enabled_groups.forEach(group => {
        var data = load_json_sync(`https://raw.githubusercontent.com/Awesome7285/Music-APWorld/refs/tags/${VERSION}/locations/${groupToID(group)}.json`)
        if (data == undefined) {
            data = load_json_sync(`./data/locations/${groupToID(group)}.json`)
        }
        locations.push(...data);
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

//Temp until I think of a better solution
function groupToID(group) {
    match = {
        "pc98": "00",
        "mainline_games": "01",
        "fighting_games": "02",
        "spinoff_shmups": "03",
        "zuns_music_collection": "04",
        "print_works_cds": "05",
        "seihou": "06",
        "lenen": "07",
        "digital_wing": "10",
        "digital_wing_ravers_nest": "11",
        "digital_wing_dance_anthem": "12",
        "halozy": "13",
        "sound_refil": "14",
        "k2e_cradle": "15",
        "silver_forest": "16",
        "amateras_records": "17",
        "star_revenge": "81",
        "siivagunner": "91",
        "click_the_bart": "99",
    }

    return `${match[group]}%20${group}`
}