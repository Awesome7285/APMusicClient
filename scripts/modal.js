const songList = document.getElementById('song-list');
const albumList = document.getElementById('album-list');
var selectedSong = null;

// Open the modal
function openModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
    get_enabled_games();
    selectedSong = null;
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
    }
}

function get_enabled_games() {
    albumList.innerHTML = ""; // Clear previous list
    songList.innerHTML = "";
    
    // Create game option
    Object.keys(regions).forEach(album => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = album;
        cell.className = "game-row";
        const img = document.createElement('img');
        const img_container = document.createElement('div');
        img_container.className = "modal-item";
        
        // AP Check
        item_obtained = document.getElementById(regionGetRequirements(album));
        if (item_obtained !== null) {
            img.src = `./../tracker/${ap_game}/${album_type_name}/${item_obtained.id.replace(/[":]+/g, "")}.png`;
            
            if (item_obtained.className == "charImageObtained") {
                row.addEventListener('click', () => showSongs(album));
                img.className = "charImageObtained";
            } else {
                cell.style = "color: red; cursor: not-allowed;"
                img.className = "charImage";
            }

            img_container.appendChild(img);
        } else {
            row.addEventListener('click', () => showSongs(album));
        }

        row.appendChild(cell);
        row.appendChild(img_container);
        albumList.appendChild(row);
    })
}

function showSongs(album) {
    songList.innerHTML = ""; // Clear previous list
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
        row.appendChild(requirements_container);
        row.appendChild(queue);
        songList.appendChild(row);
    });
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