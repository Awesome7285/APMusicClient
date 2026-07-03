const songList = document.getElementById('song-list');
const albumList = document.getElementById('album-list');
var selectedSong = null;
var cachedLogic = {};
var poptrackerColors = ["#333333", "#00ff00", "#cc0000", "#006400"]

// Open the modal
function openModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
    get_enabled_games();
    selectedSong = null;
    cachedLogic = {};
}

// Close the modal
function closeModal(event) {
    // Close only if clicking outside the modal or "Close" button
    if (!event || event.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').style.display = 'none';
    }

    for (var i = 0; i < locations.length; i++) {
        if (selectedSong == locations[i]) {
            song_index = i;
        }
    }
    if (currentSong != selectedSong){
        update_track_info(selectedSong);
    } else {
        nextInQueue();
    }
}

function get_enabled_games() {
    albumList.innerHTML = ""; // Clear previous list
    songList.innerHTML = "";
    
    // Create game option
    Object.keys(regions).forEach(album => {
        // Cache Logic
        cachedLogic[album] = 0
        locations.forEach(song => {
            if (song["region"] != album) {
                return;
            }

            let location = song["name"];
            let requirements = locationGetRequirements(location);
            // 0 means grey, 0b01 means green, 0b10 means red
            if (!checked_locations.includes(data_package["location_name_to_id"][location])) {
                if (requirementsIsInLogic(requirements)) {
                    // Green
                    cachedLogic[album] = cachedLogic[album] | 1
                } else {
                    // Red
                    cachedLogic[album] = cachedLogic[album] | 2
                }
            } else {
                // Grey
                cachedLogic[album] = cachedLogic[album] | 0
            }
            
        })

        // Actually make the modal
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = album;
        cell.className = "game-row";
        const img = document.createElement('img');
        const img_container = document.createElement('div');
        img_container.className = "modal-item";
        const logic_square = document.createElement('div');
        logic_square.className = "poptracker-square";
        
        // AP Check
        item_obtained = document.getElementById(regionGetRequirements(album));
        if (item_obtained !== null) {
            img.src = `./tracker/${album_type_name}/${item_obtained.id.replace(/[":]+/g, "")}.png`;
            
            if (item_obtained.className == "charImageObtained") {
                row.addEventListener('click', () => showSongs(album));
                img.className = "charImageObtained";
                logic_square.style.backgroundColor = poptrackerColors[cachedLogic[album]];
            } else {
                cell.style = "color: red; cursor: not-allowed;"
                img.className = "charImage";
                logic_square.style.backgroundColor = poptrackerColors[2];
            }

            img_container.appendChild(img);
        } else {
            row.addEventListener('click', () => showSongs(album));
        }

        row.appendChild(logic_square);
        row.appendChild(cell);
        row.appendChild(img_container);
        albumList.appendChild(row);

        
    })
    console.log(cachedLogic)
}

function showSongs(album) {
    songList.innerHTML = ""; // Clear previous list
    selectedSong = null;
    locations.forEach(song => {
        if (song["region"] != album) {
            return;
        }
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = location_to_track_name(song['name']);
        cell.className = "track-row";
        cell.id = song["name"] + "song-button";
        const queue = document.createElement('td');
        queue.textContent = "+1";
        queue.className = "track-row-queue";
        queue.id = song["name"] + "queue";

        // Logic
        let location = song["name"];
        let requirements = locationGetRequirements(location);
        if (requirementsIsInLogic(requirements)) {
            if (checked_locations.includes(data_package["location_name_to_id"][location])) {
                cell.style = "color: grey";
                queue.style = "color: grey";
            } else {
                cell.style = "color: green";
                queue.style = "color: green";
            }
            cell.addEventListener('click', () => selectSong(song));
            queue.addEventListener('click', () => addSongToQueue(song));
        } else {
            cell.style = "color: red; cursor: not-allowed;";
            queue.style = "color: red; cursor: not-allowed;";
        }

        row.appendChild(cell);

        // Add Images
        const requirements_container = addRequirementImages(requirements)
        
        row.appendChild(requirements_container);
        row.appendChild(queue);
        songList.appendChild(row);
    });
}

function addRequirementImages(requirements) {
    // Add Images
    const requirements_container = document.createElement('div');
    requirements_container.id = "requirements-container";
    Object.keys(flattenRequirements(requirements)).forEach(item => {
        const img = document.createElement('img');
        const img_container = document.createElement('div');

        let amount = requirements[item];

        // Item Amount
        const count = document.createElement("span");
        count.textContent = amount;
        count.style = "display: block;";
        count.className = "item-count";

        item_tracker = document.getElementById(item);
        img.src = item_tracker.src;
        img_container.className = "modal-item";
        var js_stupidity = {};
        js_stupidity[item] = amount;
        if (requirementsIsInLogic(js_stupidity)) {
            img.className = "charImageObtained";
            img.title = item + "\n(Obtained)";
        } else {
            img.className = "charImage";
            img.title = item + "\n(Unobtained)";
        }

        

        // Add
        img_container.appendChild(img);
        if (amount > 1) { 
            img_container.appendChild(count);
            img.title += "\nRequires: " + amount;
        }
        requirements_container.appendChild(img_container);
    })
    
    requirements_container.style = "width: " + (40 * requirements_container.childElementCount);
    return requirements_container
}

function selectSong(song) {
    selectedSong = song;
    var selectedSongElement = document.getElementById(song['name'] + "song-button");
    document.querySelectorAll(".track-row").forEach(btn => btn.style.background = "");
    selectedSongElement.style.background = "#ccc";
}

function addSongToQueue(song) {
    // Bad Code
    for (var i = 0; i < locations.length; i++) {
        if (song == locations[i]) {
            queue.push(i);
        }
    }
    
    const queue_text = document.getElementById("queue-text");
    var q = document.createElement("p");
    q.textContent = locations[queue[queue.length - 1]]["name"];
    queue_text.appendChild(q);
}

function shuffleQueue(arr1, parentElement) {
    const children = Array.from(parentElement.children);
  
    for (let i = children.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr1[i], arr1[j]] = [arr1[j], arr1[i]];
        [children[i], children[j]] = [children[j], children[i]];
    }
  
    children.forEach(child => parentElement.appendChild(child));
}

function addAllInLogic() {
    Object.keys(regions).forEach(album => {
        item_obtained = document.getElementById(regionGetRequirements(album));
        if (item_obtained !== null) {
            if (item_obtained.className == "charImageObtained") { // If you have the album's item...
                locations.forEach(song => {
                    if (song["region"] != album) {
                        return;
                    }
                    let location = song["name"];
                    if (!checked_locations.includes(data_package["location_name_to_id"][location])) { // If you havent done the check already...
                        let requirements = locationGetRequirements(location);
                        if (requirementsIsInLogic(requirements)) { // If the song is in logic...
                            addSongToQueue(song); // Add the song to the queue
                        }
                    }
                })
            }
        }
    })
}