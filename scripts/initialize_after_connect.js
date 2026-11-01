async function doConnect() {
    let temp_items = {}
    let promises = Object.values(slot_data.enabled_groups).map(group => {
        return load_json(`./data/${group}.json`)
        .catch(() => {return load_json(`https://raw.githubusercontent.com/Awesome7285/Music-APWorld/refs/tags/${VERSION}/locations/${group}.json`)})
        .then(data => {
            locations.push(...data['locations']);
            locations.forEach(loc => {
                locations_to_reqs[loc['name']] = loc['requires'];
            })
            temp_items[parseInt(group.split(' ')[0])] = data['items'];
        })
    })
    
    song_index = 0;
    currentSong = null;
    queue = [];

    Promise.all(promises)
    .then(() => {
        Object.values(temp_items).forEach(items => {
            Object.keys(items).forEach(cat => {
                category_to_items[cat] = category_to_items[cat] || {};
                category_to_items[cat] = {...category_to_items[cat], ...items[cat]};
            })
        })
        createTracker();
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