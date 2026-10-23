async function doConnect() {
    let promises = Object.keys(slot_data.enabled_groups).map(group => {
        return load_json(`./data/${slot_data.enabled_groups[group]}.json`)
        .catch(() => {return load_json(`https://raw.githubusercontent.com/Awesome7285/Music-APWorld/refs/tags/${VERSION}/locations/${slot_data.enabled_groups[group]}.json`)})
        .then(data => {
            locations.push(...data['locations']);
            locations.forEach(loc => {
                locations_to_reqs[loc['name']] = loc['requires'];
            })
            Object.keys(data['items']).forEach(cat => {
                category_to_items[cat] = category_to_items[cat] || {};
                category_to_items[cat] = {...category_to_items[cat], ...data['items'][cat]};
            })
        })
    })
    
    song_index = 0;
    currentSong = null;
    queue = [];

    Promise.all(promises)
    .then(() => {
        if (VERSION == "v1.1.0") { // Latest
            createTracker();
        }
    })
    

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