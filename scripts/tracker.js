function createTracker() {

    console.log(category_to_items);
    category_to_items = {...category_to_items, "Bounty": {"Bounty": {}}};

    const ap_tracker = document.getElementById("ap-tracker")
    ap_tracker.innerHTML = "";
    Object.keys(category_to_items).forEach(category => {
        const tracker_section = document.createElement("div");
        Object.keys(category_to_items[category]).forEach(item => {
            if (slot_data.enabled_albums.includes(item) || Object.keys(slot_data.misc_prog).includes(item) || item == "Bounty") {
                var it = document.createElement("div");
                var im = document.createElement("img");
                var imObj = new Image();
                imObj.src = `./tracker/${category}/${item.replace(/[<>:"\/\\|?*’]+/g, "")}.png`;
                im.src = imObj.src;
                imObj.onerror = function () {
                    im.src = category_to_items[category][item]['url'];
                }
                im.className = "charImage";
                im.id = item;
                im.title = item + "\n(Unobtained)";
                // Item Count
                var count = document.createElement("span")
                count.textContent = 0;
                count.id = item + "-count";
                count.className = "item-count";
                it.appendChild(im);
                it.appendChild(count);
                it.className = "tracker-item";
                tracker_section.appendChild(it);
            }
        })
        ap_tracker.appendChild(tracker_section);
        ap_tracker.appendChild(document.createElement("br"))
    })

    // Now receive items
    tracker_created = true;
    awaiting_packets.forEach(packet => {
        updateTracker(packet)
    })
    awaiting_packets = []
}

function updateTracker(packet) {
    // Waiting for the async function
    if (tracker_created == false) {
        awaiting_packets.push(packet)
        return
    }
    packet["items"].forEach(item => {
        var item_id = item.item;
        var received = full_data_package[ap_game]["item_id_to_name"][item_id];
        //console.log(received)
        im = document.getElementById(received);
        if (im == undefined) {
            return;
        }
        // Update Count
        count = document.getElementById(received + "-count");
        count.textContent++;
        im.className = "charImageObtained";
        im.title = received + "\n(Obtained)";
        if (count.textContent > 1) {
            count.style.display = "block";
            im.title += "\nCount: " + count.textContent;
        } else {
            count.style.display = "none";
        }
        
    });
}
