// AP Stuff
let socket;
let data_package;
let checked_locations;
let locations;
let regions;
let victory;
let ap_host;
let ap_slot;
let ap_game = document.getElementById("ap-game").value;
let connected = false;

// Meta Stuff
let colon_names;
let album_type_name;
let use_alt_names;

createTracker();

function ap_connect() {
    ap_host = document.getElementById("ap-host").value
    ap_slot = document.getElementById("ap-slot").value
    ap_game = document.getElementById("ap-game").value
    if (!ap_host.startsWith("ws")) {
        ap_host = "wss://" + ap_host;
    }
    socket = new WebSocket(ap_host);

    socket.addEventListener("open", () => {
        console.log("WebSocket opened, waiting for RoomInfo...");
    });

    socket.addEventListener("message", (event) => {
        const msg = JSON.parse(event.data)[0];
        console.log("Server:", msg);
        //console.log("cmd field:", msg.cmd);

        // 1. Server should send this first
        if (msg.cmd === "RoomInfo") {
            console.log("Connected to Archipelago server");
            socket.send(JSON.stringify([{ cmd: "GetDataPackage", games: [ap_game] }]));
        }
        if (msg.cmd === "Connected") {
            checked_locations = msg.checked_locations;
        }
        if (msg.cmd === "DataPackage") {
            // Get an ideal DP
            data_package = msg.data["games"][ap_game];
            // Send a connection packet
            socket.send(JSON.stringify([{
                cmd: "Connect",
                game: ap_game,
                uuid: crypto.randomUUID(),
                name: ap_slot,
                password: null,
                version: { major: 0, minor: 6, build: 3, class: "Version"},
                tags: ["WebHost", "DeathLink", "RingLink"],
                items_handling: 7,
                slot_data: false
            }]));
            socket.send(JSON.stringify([{
                cmd: "Sync",
            }]))
            // REMAKE TRACKER
            createTracker();
            doConnect();
            connected = true;
        }
        if (msg.cmd === "ReceivedItems") {
            updateTracker(msg);
        }
        if (msg.cmd === "Bounced") {
            if (msg.tags) {
                if (msg.tags.includes("RingLink")) {
                    receivedRingLink(msg);
                }
                if (msg.tags.includes("DeathLink")) {
                    receivedDeathLink(msg);
                }
            }
        }
    });

    socket.addEventListener("close", (event) => {
        console.log("Disconnected:", event);
        connected = false;
    });
}

// Return the Track name from the location with the album name in consideration
function location_to_track_name(location_name) {
    if (colon_names) {
        return location_name.split(': ')[1];
    } else {
        return location_name
    }
}

// Send a location
function sendLocation() {
    if (connected) {
        location_name = locations[song_index]['name'];

        locs_to_send = [data_package["location_name_to_id"][location_name]]
        socket.send(JSON.stringify([{
            cmd: "LocationChecks",
            locations: locs_to_send
        }]));

        if (!checked_locations.includes(locs_to_send[0])) {
            checked_locations.push(locs_to_send[0]);
        }
        
    } else {
        console.log("No AP Connection.")
    }
}

// Region Get Requirements (Used in modal logic)
function regionGetRequirements(album) {
    let requirements = regions[album]["requires"];
    
    let requirements_dict = parseRequirements(requirements);
    if (Object.keys(requirements_dict).length == 0) {
        return null;
    } else if (Object.keys(requirements_dict).length == 1) {
        return Object.keys(requirements_dict)[0];
    } else {
        console.log("The following requirements are a little fucky: ", album);
        return null;
    }
    
}

// Get Requirements for a location name (Used in modal logic)
function locationGetRequirements(location) {
    let loc_index;
    for (let i = 0; i < locations.length; i++) {
        if (locations[i]["name"] == location) {
            loc_index = i;
            break;
        }
    }

    // Requirements
    let requirements;
    if (loc_index === undefined) {
        requirements = "";
        console.log("Location could not be found", location);
    } else {
        requirements = locations[loc_index]["requires"];
    }
    
    return parseRequirements(requirements);
    // reqs = locations[loc_index]["requires"];
    // if (reqs.length < 1) {
    //     return [];
    // }
    // let requirements = [...reqs.matchAll(/\|([^|]+)\|/g)].map(m => m[1]);
    // // Region
    // // reg_reqs = regions[locations[loc_index]["region"]]["requires"];
    // // reg_reqs = reqs.replace(/[\|]+/g, "");
    // // requirements += reg_reqs.split(" AND ");
    // requirements = requirements.filter((item) => item !== "");
    // console.log(requirements)
    // return requirements;
}

// Requirements Parser written by ChatGPT, it does this:
// example_requirements = "|Item1| AND |Item2:7| AND (|Item3| OR |Item4|)";
// example_output = {"Item1": 1, "Item2": 7, {"Item3": 1, "Item4": 1}};
function parseRequirements(input) {
    // I hate Manual
    if (typeof(input) == "object") {
        input = "";
    }

    // helper to parse an individual token like |Item| or |Item:7|
    function parseItem(token) {
        const match = token.match(/\|([^:|]+)(?::(\d+))?\|/);
        if (!match) return {};
        const name = match[1];
        const count = match[2] ? parseInt(match[2], 10) : 1;
        return { [name]: count };
    }

    // recursive parsing of expression
    function parseExpr(expr) {
        expr = expr.trim();

        // Handle parentheses
        if (expr.startsWith("(") && expr.endsWith(")")) {
        return parseExpr(expr.slice(1, -1));
        }

        // Handle OR
        if (expr.includes(" OR ")) {
        return {
            group: expr.split(" OR ").map(sub => parseExpr(sub))
        };
        }

        // Handle AND
        if (expr.includes(" AND ")) {
        return expr.split(" AND ")
            .map(sub => parseExpr(sub))
            .reduce((acc, obj) => Object.assign(acc, obj), {});
        }

        // Otherwise must be an item
        return parseItem(expr);
    }

    return parseExpr(input);
}

// Flatten function
function flattenRequirements(req) {
  const result = {};

  function recurse(node) {
    if (!node) return;

    for (const key in node) {
      if (key === "group" && Array.isArray(node.group)) {
        node.group.forEach(sub => recurse(sub));
      } else {
        result[key] = (result[key] || 0) + node[key];
      }
    }
  }

  recurse(req);
  return result;
}

/* REWRITE ALL THE FOLLOWING FUNCTIONS */



function requirementsIsInLogic(requirements) {
    yes = true;
    Object.keys(requirements).forEach(item => {
        if (item === "group") {
            yes = yes && requirementsIsInLogicOR(requirements[item])
        } else {
            let amount = requirements[item];
            item_tracker = document.getElementById(item);
            yes = yes && (item_tracker.className === "charImageObtained") && (document.getElementById(item+"-count").textContent >= amount);
        }
    })
    return yes;
}

function requirementsIsInLogicOR(requirements) {
    yes = true;
    Object.keys(requirements).forEach(item => {
        let amount = requirements[item];
        item_tracker = document.getElementById(item);
        yes = yes || (item_tracker.className === "charImageObtained") && (document.getElementById(item+"-count").textContent >= amount);
    })
    return yes;
}