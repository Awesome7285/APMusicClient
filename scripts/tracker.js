function createTracker() {
    // Load items from items.json
    let items = load_json_sync(`./../data/${ap_game}/items.json`);
    let categories = {};
    let category_order = [];
    items.forEach(item => {
        let prog = item["progression"] ?? item["progression_skip_balancing"] ?? false;
        if (prog) {
            // Only check first item in category
            item_cat = item["category"][0];
            if (Object.keys(categories).includes(item_cat)) {
                categories[item_cat].push(item["name"]);
            } else {
                categories[item_cat] = [item["name"]];
                category_order.push(item_cat);
            }
        }
    })

    // Create images tracker based on items.json
    const ap_tracker = document.getElementById("ap-tracker")
    ap_tracker.innerHTML = "";
    category_order.forEach(category => {
        const tracker_section = document.createElement("div");
        categories[category].forEach(item => {
            var it = document.createElement("div")
            var im = document.createElement("img")
            im.src = `./../tracker/${ap_game}/${category}/${item.replace(/[<>:"\/\\|?*’]+/g, "")}.png`
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
        })
        ap_tracker.appendChild(tracker_section);
        ap_tracker.appendChild(document.createElement("br"))
    })
}

function updateTracker(packet) {
    packet["items"].forEach(item => {
        var item_id = item.item
        var received = getKeyByValue(data_package["item_name_to_id"], item_id)
        console.log(received)
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

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}