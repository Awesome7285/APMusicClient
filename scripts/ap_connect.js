// AP Stuff
let socket;
let data_package;
let full_data_package;
let checked_locations;
let slash_received = [];
let locations = [];
let regions;
let victory;
let ap_host;
let ap_slot;
let ap_game = "Touhou Music";
let ap_slot_id;
let slot_data;
let slot_info;
let names_to_games;
let uuid = crypto.randomUUID();
let connected = false;
let tracker_created = false;
var awaiting_packets = [];
let VERSION;

// Meta Stuff
let album_type_name;


function ap_connect() {
    ap_host = document.getElementById("ap-host").value
    ap_slot = document.getElementById("ap-slot").value
    if (!ap_host.startsWith("ws")) {
        ap_host = "wss://" + ap_host;
    }
    socket = new WebSocket(ap_host);

    socket.addEventListener("open", () => {
        console.log("WebSocket opened, waiting for RoomInfo...");
    });

    socket.addEventListener("message", (event) => {
        JSON.parse(event.data).forEach(msg => {

        
            //const msg = JSON.parse(event.data)[0];
            console.log("Server:", msg);
            //console.log("cmd field:", msg.cmd);

            // 1. Server should send this first
            if (msg.cmd === "RoomInfo") {
                console.log("Connected to Archipelago server");
                socket.send(JSON.stringify([{ cmd: "GetDataPackage" }]));
            }
            if (msg.cmd === "Connected") {
                checked_locations = msg.checked_locations;
                slot_data = msg.slot_data;
                slot_info = msg.slot_info;
                ap_slot_id = msg.slot;
                names_to_games = Object.fromEntries(Object.values(slot_info).map(item => [item.name, item.game]));
                VERSION = slot_data.version ?? "v0.1.0"
                document.getElementById("requiredBounties").textContent = "Bounties required to goal: " + slot_data["goal_requirement"]
                // REMAKE TRACKER
                createTracker();
                doConnect();
            }
            if (msg.cmd === "DataPackage") {
                // Get an ideal DP
                data_package = msg.data["games"][ap_game];
                full_data_package = msg.data["games"];
                // Send a connection packet
                socket.send(JSON.stringify([{
                    cmd: "Connect",
                    game: ap_game,
                    uuid: uuid,
                    name: ap_slot,
                    password: null,
                    version: { major: 0, minor: 6, build: 7, class: "Version"},
                    tags: tags,
                    items_handling: 7,
                    slot_data: true
                }]));
                socket.send(JSON.stringify([{
                    cmd: "Sync",
                }]))
                connected = true;
            }
            if (msg.cmd === "ReceivedItems") {
                if (JSON.stringify(msg.items[0]) !== JSON.stringify(slash_received[0])) {
                    slash_received.push(...msg.items);
                    updateTracker(msg);
                } else {
                    console.log("The previous ReceivedItems packet was not parsed.")
                }
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
            if (msg.cmd === "PrintJSON") {
                var message_dict = {};
                if (msg.type === "ItemSend" || msg.type === "Hint") {
                    msg.data.forEach(t => {
                        [a,b] = formatTextLog(t);
                        message_dict[a] = b;
                    })
                }
                else if (["Join", "Part", "Tutorial", "Chat", "CommandResult", "ItemCheat", "Goal", "Release", "Collect", "Countdown", "AdminCommandResult", "TagsChanged", "ServerChat"].includes(msg.type)) {
                    message_dict[msg.data[0].text] = "black";
                }
                else {
                    message_dict["An Unknown Message was sent from the AP Server. " + msg.data[0].text] = "black";
                }
                // console.log(message_dict);
                // text_client_log(text);
                text_client_log_colour(message_dict);
            }
        })
    });

    socket.addEventListener("close", (event) => {
        console.log("Disconnected:", event);
        connected = false;
    });
}

function ap_disconnect() {
    socket.close()
    connected = false;
}

// Return the Track name from the location with the album name in consideration
function location_to_track_name(location_name) {
    var index = location_name.indexOf(": ")
    return location_name.slice(index + 2)
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

//
function send_victory() {
    if (connected) {

        if (document.getElementById("Bounty-count").textContent >= slot_data["goal_requirement"]) {
            socket.send(JSON.stringify([{
                cmd: "StatusUpdate",
                status: 30
            }]));
        } else {
            console.log("Required Bounties to goal: ", slot_data["goal_requirement"])
        }
        
    } else {
        console.log("No AP Connection.")
    }
}