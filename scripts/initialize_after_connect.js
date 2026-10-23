async function doConnect() {
    let promises
    // This part will get deleted when tbaec4 ends
    if (VERSION == "v0.1.0") {
        promises = slot_data.enabled_groups.map(group => {
            return load_json(`https://raw.githubusercontent.com/Awesome7285/Music-APWorld/refs/tags/${VERSION}/locations/${groupToID(group)}.json`)
            .catch(() => {return load_json(`./data/${groupToID(group)}.json`)})
            .then(data => {
                locations.push(...data);
                locations.forEach(loc => {
                    locations_to_reqs[loc['name']] = loc['requires'];
                })
            })
        })
    // Delete this when jukebox async ends
    } else if (VERSION == "v1.0.1") {
        // Load JSON immediately before anything else runs
        promises = Object.keys(slot_data.enabled_groups).map(group => {
            return load_json(`https://raw.githubusercontent.com/Awesome7285/Music-APWorld/refs/tags/${VERSION}/locations/${slot_data.enabled_groups[group]}.json`)
            .catch(() => {return load_json(`./data/${slot_data.enabled_groups[group]}.json`)})
            .then(data => {
                locations.push(...data);
                locations.forEach(loc => {
                    locations_to_reqs[loc['name']] = loc['requires'];
                })
            })
        })
    } else { // Latest
        promises = Object.keys(slot_data.enabled_groups).map(group => {
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
    }
    
    song_index = 0;
    currentSong = null;
    queue = [];

    Promise.all(promises)
    .then(() => {
        let promise;
        if (VERSION == "v1.1.0") { // Latest
            createTracker();
        } else { // Old versions that check for misc_progression.json
            promise = load_json(`https://raw.githubusercontent.com/Awesome7285/Music-APWorld/refs/tags/${VERSION}/items/misc_progression.json`)
            .then(data => {
                let items = data;
                items.forEach(item => {
                    // Check if item is in slot data
                    if (Object.keys(slot_data.misc_prog).includes(item["name"]) ) {
                        // Only check first item in category
                        item_cat = item["category"][0];
                        if (Object.keys(category_to_items).includes(item_cat)) {
                            category_to_items[item_cat].push(item["name"]);
                        } else {
                            category_to_items[item_cat] = [item["name"]];
                        }
                    }
                })
            })
            Promise.all([promise])
            .then(() => {
                createTracker();
            })
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

//Temp until I think of a better solution
// Delete after tbaec4 ends
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